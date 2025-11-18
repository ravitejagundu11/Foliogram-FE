import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageSelector from '@components/common/PageSelector'

const Layout = () => {
  const showPageSelector = import.meta.env.VITE_SHOW_PAGE_SELECTOR === 'true'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showPageSelector && <PageSelector />}
    </div>
  )
}

export default Layout
