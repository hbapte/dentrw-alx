import React from "react"

const AnnouncementBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white text-sm text-center py-2 px-4">
      DentRW v4 is here with new features and improvements.{" "}
      <a
        href="https://dentrw.hbapte.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold hover:text-blue-200 transition-colors">
        Explore now &rarr;
      </a>
    </div>
  )
}

export default AnnouncementBar
