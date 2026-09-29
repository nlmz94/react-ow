'use client'

import {
  faCalendar, faCamera, faCircleCheck, faCircleUser, faCloudArrowUp, faEnvelope,
  faShieldHalved, faSpinner, faUpload, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { apiErrorMessage, formatDate } from '@/lib/format'
import { ACCEPTED_TYPES, MAX_DIMENSION, dimensionsError, fileError, readImageSize } from '@/lib/image'
import type { User } from '@/lib/types'
import { LoadingState } from './LoadingState'
import { UserAvatar } from './UserAvatar'

export function ProfileView() {
  const router = useRouter()
  const { user, ready, setUser } = useAuth()

  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragging, setDragging] = useState(false)

  // The session cookie is on the API origin, so the guard can only run in the browser.
  // It only turns away visitors who arrived signed out: signing out here is the Nav's
  // navigation to handle, and a redirect from this effect would supersede it.
  const hadUser = useRef(false)
  useEffect(() => {
    if (user) hadUser.current = true
    else if (ready && !hadUser.current) router.replace('/login?redirect=/profile')
  }, [ready, user, router])

  // Free the preview's object URL whenever it's replaced, and on unmount.
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  function clearSelection() {
    setPreview(null)
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function select(selected: File | undefined) {
    setError('')
    setSuccess(false)
    clearSelection()
    if (!selected) return

    const invalid = fileError(selected)
    if (invalid) {
      setError(invalid)
      return
    }

    const url = URL.createObjectURL(selected)
    try {
      const tooLarge = dimensionsError(await readImageSize(url))
      if (tooLarge) {
        URL.revokeObjectURL(url)
        setError(tooLarge)
        return
      }
    }
    catch {
      URL.revokeObjectURL(url)
      setError('This file could not be read as an image.')
      return
    }

    setFile(selected)
    setPreview(url)
  }

  async function upload() {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('profile_picture', file)
      const res = await apiFetch<{ data: User }>('/me/profile-picture', { method: 'POST', body })
      setUser(res.data)
      clearSelection()
      setSuccess(true)
    }
    catch (e) {
      setError(apiErrorMessage(e, 'Failed to upload the picture. Please try again.'))
    }
    finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <h1><FontAwesomeIcon icon={faCircleUser} /> Profile</h1>

      {!user
        ? <LoadingState />
        : (
            <>
              <section className="card mb-5 flex flex-col items-center gap-5 p-6 text-center min-[481px]:flex-row min-[481px]:text-left">
                <UserAvatar image={user.profilePic} size={96} />
                <div className="min-w-0">
                  <h2 className="mt-0 mb-1 text-[1.2rem] wrap-anywhere">{user.username || user.email}</h2>
                  {user.username && <p className="my-0.5 text-muted"><FontAwesomeIcon icon={faEnvelope} /> {user.email}</p>}
                  <p className="my-0.5 text-muted"><FontAwesomeIcon icon={faCalendar} /> Member since {formatDate(user.createdAt)}</p>
                  {user.roles.includes('ROLE_ADMIN') && (
                    <p className="my-0.5"><span className="tag"><FontAwesomeIcon icon={faShieldHalved} /> Admin</span></p>
                  )}
                </div>
              </section>

              <section className="card mb-5 p-6">
                <h2 className="mt-0 mb-3 text-[1.2rem]"><FontAwesomeIcon icon={faCamera} /> Profile picture</h2>

                {error && <div className="alert" role="alert">{error}</div>}
                {success && <p className="text-success"><FontAwesomeIcon icon={faCircleCheck} /> Profile picture updated.</p>}

                <label
                  className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-6 text-center hover:border-primary hover:bg-surface-2 ${dragging ? 'border-primary bg-surface-2' : 'border-border'}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setDragging(false)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    void select(e.dataTransfer.files[0])
                  }}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    className="sr-only"
                    onChange={e => void select(e.target.files?.[0])}
                  />
                  {preview
                    // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, nothing to optimize
                    ? <img src={preview} alt="Preview" className="size-[150px] rounded-full object-cover" />
                    : (
                        <>
                          <FontAwesomeIcon icon={faCloudArrowUp} className="text-[2.2rem] text-primary" />
                          <span><strong>Click to choose</strong> or drag an image here</span>
                        </>
                      )}
                  <span className="text-[0.8rem] text-muted">JPEG, PNG or WebP · max 5 MB · max {MAX_DIMENSION}×{MAX_DIMENSION}px</span>
                </label>

                {file && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="mr-auto truncate text-muted">{file.name}</span>
                    <button className="btn" type="button" disabled={uploading} onClick={clearSelection}>
                      <FontAwesomeIcon icon={faXmark} /> Cancel
                    </button>
                    <button className="btn btn-primary" type="button" disabled={uploading} onClick={upload}>
                      <FontAwesomeIcon icon={uploading ? faSpinner : faUpload} spin={uploading} /> Upload
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
    </div>
  )
}
