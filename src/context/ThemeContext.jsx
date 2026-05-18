import { createContext, useContext, useState, useEffect } from 'react'
import { lightTheme, darkTheme } from '../styles/theme'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('timevia-theme') === 'dark'
  })

  const T = isDark ? darkTheme : lightTheme

  useEffect(() => {
    localStorage.setItem('timevia-theme', isDark ? 'dark' : 'light')
    document.body.style.background = T.bg
    document.body.style.color = T.text
  }, [isDark])

  function toggleTheme() {
    setIsDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ T, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}