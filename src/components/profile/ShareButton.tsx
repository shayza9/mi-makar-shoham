'use client'

interface Props {
  name: string
  profileId: string
}

export default function ShareButton({ name, profileId }: Props) {
  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profileId}`
    const text = `היי! מצאתי את ${name} דרך מי מכיר? שוהם והאזור.\nכדאי לבדוק: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
    >
      📲 שתף
    </button>
  )
}
