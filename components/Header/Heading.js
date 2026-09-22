// Section title used across the home page. `first` is a small eyebrow line,
// `second` the main title. Home sections all sit on a white background.
const Heading = ({ first = '', second = '', className = '', center = true }) => (
  <div className={`${center ? 'text-center' : 'text-left'} ${className}`}>
    {first && (
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 sm:text-sm">
        {first}
      </p>
    )}
    {second && (
      <h2 className="mt-1 text-2xl font-semibold uppercase tracking-wide text-gray-900 sm:text-3xl lg:text-4xl">
        {second}
      </h2>
    )}
    <span
      aria-hidden="true"
      className={`mt-3 block h-0.5 w-12 bg-black ${center ? 'mx-auto' : ''}`}
    />
  </div>
);

export default Heading;
