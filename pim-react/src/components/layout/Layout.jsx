import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-100 font-sans text-stone-900 antialiased">
      <Sidebar />
      <div className="ml-[200px] flex flex-col min-h-screen w-full">
        {children}
      </div>
    </div>
  )
}
