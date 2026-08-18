import { redirect } from 'next/navigation'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item))
    } else if (value) {
      query.set(key, value)
    }
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ''
  redirect(`/${suffix}#agenda`)
}
