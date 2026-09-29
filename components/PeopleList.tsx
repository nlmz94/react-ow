'use client'

import { faMicrophone, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

export interface PersonItem {
  key: string
  name: string
  image: string | null
  role: string
  voiceActor?: string
}

export function PeopleList({ people, limit }: { people: PersonItem[], limit: number }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? people : people.slice(0, limit)

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {visible.map(person => (
          <div key={person.key} className="card flex gap-3 overflow-hidden">
            {person.image
              // eslint-disable-next-line @next/next/no-img-element -- AniList CDN images, already sized
              ? <img src={person.image} alt={person.name} loading="lazy" className="h-[88px] w-16 shrink-0 object-cover" />
              : <div className="grid h-[88px] w-16 shrink-0 place-items-center bg-surface-2 text-muted"><FontAwesomeIcon icon={faUser} /></div>}
            <div className="flex min-w-0 flex-col justify-center py-2 pr-2 text-[0.9rem]">
              <strong>{person.name}</strong>
              <span className="text-muted">{person.role}</span>
              {person.voiceActor && (
                <span className="text-[0.8rem] text-muted"><FontAwesomeIcon icon={faMicrophone} /> {person.voiceActor}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {people.length > limit && (
        <button type="button" className="btn mt-3" onClick={() => setShowAll(value => !value)}>
          {showAll ? 'Show less' : `Show all ${people.length}`}
        </button>
      )}
    </>
  )
}
