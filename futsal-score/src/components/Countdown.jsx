import React, { useState, useEffect } from "react"

const formatTime = (timeInMs) => {
  if (timeInMs <= 0) return "AGORA!"

  const totalSeconds = Math.floor(timeInMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)

  const hours = totalHours % 24
  const minutes = totalMinutes % 60
  const seconds = totalSeconds % 60

  let output = ""
  if (days > 0) output += `${days}d `

  if (hours > 0 || days > 0) output += `${String(hours).padStart(2, '0')}h `
  output += `${String(minutes).padStart(2, '0')}m `
  output += `${String(seconds).padStart(2, '0')}s`

  return output.trim()
}

export default function Countdown({ targetDate, eventTitle, eventLocal }) {

  const targetTime = new Date(targetDate).getTime()

  const [timeRemaining, setTimeRemaining] = useState(targetTime - new Date().getTime())

  useEffect(() => {

    const interval = setInterval(() => {
      setTimeRemaining(targetTime - new Date().getTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTime])

  const countdownText = formatTime(timeRemaining)

  if (timeRemaining <= 0) {
    return (
      <div className="text-center p-6 bg-green-100 rounded-xl shadow-md border border-green-300">
        <p className="text-sm font-medium text-gray-500 mb-2">Evento em andamento:</p>
        <p className="text-xl font-bold text-green-700">✅ {eventTitle || "Evento"} ACONTECENDO AGORA!</p>
        {eventLocal && <p className="text-sm text-green-600 mt-1">Local: {eventLocal}</p>}
      </div>
    )
  }

  return (
    <div className="text-center p-6 bg-blue-50 rounded-xl shadow-md border border-blue-200">
      <p className="text-sm font-medium text-gray-500 mb-2">Próximo Evento:</p>
      <h3 className="text-2xl font-extrabold text-blue-700 mb-3">{eventTitle}</h3>
      <p className="text-4xl font-black text-blue-800 tracking-tight">{countdownText}</p>
      {eventLocal && <p className="text-sm text-gray-600 mt-2">Local: {eventLocal}</p>}
    </div>
  )
}