import { NavLink } from 'react-router-dom'

const NAV = [
  {
    group: 'Catalogue',
    items: [
      { to: '/products',     icon: 'ti-box',        label: 'Products' },
      { to: '/product-sets', icon: 'ti-components', label: 'Product Sets' },
      { to: '/materials',    icon: 'ti-color-swatch',label: 'Materials' },
    ],
  },
  {
    group: 'Assets',
    items: [
      { to: '/image-engine',  icon: 'ti-photo',      label: 'Image Engine' },
      { to: '/document-hub',  icon: 'ti-file-stack', label: 'Document Hub' },
    ],
  },
  {
    group: 'Publishing',
    items: [
      { to: '/social-campaign', icon: 'ti-speakerphone', label: 'Social Campaign' },
      { to: '/publish-flow',    icon: 'ti-send',          label: 'Publish Flow' },
    ],
  },
  {
    group: 'System',
    items: [
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-[200px] shrink-0 bg-white border-r border-black/10 fixed top-0 left-0 h-screen overflow-y-auto flex flex-col z-10">
      <div className="px-4 py-[18px] border-b border-black/10">
        <div className="text-sm font-semibold text-stone-900">PIM Studio</div>
        <div className="text-[11px] text-stone-500 mt-0.5">Product Info Management</div>
      </div>
      <nav className="py-2 flex-1">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <div className="text-[10px] font-medium text-stone-400 uppercase tracking-widest px-3.5 pt-3.5 pb-1">
              {group}
            </div>
            {items.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3.5 py-1.5 text-[13px] border-l-2 transition-colors',
                    isActive
                      ? 'text-brand-600 bg-brand-50 border-brand-600 font-medium'
                      : 'text-stone-500 border-transparent hover:bg-stone-50 hover:text-stone-900',
                  ].join(' ')
                }
              >
                <i className={`ti ${icon} text-base`} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-3.5 py-3 border-t border-black/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
            HC
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-700 leading-tight">Hugo Claes</div>
            <div className="text-[10px] text-stone-400 leading-tight">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
