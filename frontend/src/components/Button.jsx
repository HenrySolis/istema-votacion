export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  };

  return (
    <button
      className={`btn ${variants[variant] || 'btn-primary'} ${className} relative`}
      disabled={loading || props.disabled}
      data-loading={loading}
      {...props}
    >
      <span style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.15s' }}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </span>
      )}
    </button>
  );
}
