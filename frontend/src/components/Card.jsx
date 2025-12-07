export default function Card({ 
  children, 
  className = '', 
  padding = true,
  ...props 
}) {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`pt-4 ${className}`}>
      {children}
    </div>
  );
}
