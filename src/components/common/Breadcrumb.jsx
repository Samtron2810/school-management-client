import { NavLink } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && (
              <FaChevronRight className="text-xs text-slate-gray" />
            )}
            {isLast ? (
              <span className="text-primary font-medium">{item.label}</span>
            ) : (
              <NavLink
                to={item.path}
                className="text-slate-gray hover:text-accent transition-colors"
              >
                {item.label}
              </NavLink>
            )}
          </span>
        );
      })}
    </nav>
  );
}
