import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PeopleList, type PersonItem } from './PeopleList'

const people: PersonItem[] = Array.from({ length: 14 }, (_, i) => ({
  key: String(i),
  name: `Person ${i}`,
  image: i === 0 ? null : `https://s4.anilist.co/${i}.jpg`,
  role: 'Main',
  voiceActor: i === 1 ? 'Atsumi Tanezaki' : undefined,
}))

describe('PeopleList', () => {
  it('shows the first `limit` people and toggles the rest', async () => {
    render(<PeopleList people={people} limit={12} />)

    expect(screen.getAllByText('Main')).toHaveLength(12)
    await userEvent.click(screen.getByRole('button', { name: 'Show all 14' }))
    expect(screen.getAllByText('Main')).toHaveLength(14)
    await userEvent.click(screen.getByRole('button', { name: 'Show less' }))
    expect(screen.getAllByText('Main')).toHaveLength(12)
  })

  it('has no toggle when everyone fits', () => {
    render(<PeopleList people={people.slice(0, 8)} limit={8} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows photos, a placeholder when missing, and the voice actor', () => {
    render(<PeopleList people={people.slice(0, 2)} limit={12} />)
    expect(screen.getByRole('img', { name: 'Person 1' })).toHaveAttribute('src', 'https://s4.anilist.co/1.jpg')
    expect(screen.queryByRole('img', { name: 'Person 0' })).not.toBeInTheDocument()
    expect(screen.getByText(/Atsumi Tanezaki/)).toBeInTheDocument()
  })
})
