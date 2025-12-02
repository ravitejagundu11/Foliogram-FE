import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}

const PageHeader = ({ title, subtitle, icon: Icon, actions, className = '' }: PageHeaderProps) => {
  return (
    <div className={`page-header-standard ${className}`}>
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-header-title">
            {Icon && <Icon className="page-header-icon" size={32} />}
            {title}
          </h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
