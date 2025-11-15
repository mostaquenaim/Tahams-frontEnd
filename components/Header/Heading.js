const Heading = ({
  first = '',
  second = '',
  className = '',
  center = true,
  theme = 'dark',
}) => {
  // Theme configuration
  const themeClasses = {
    dark: {
      bg: 'bg-black',
      text: 'text-white text-opacity-80',
      border: 'border-white',
      shadow: 'shadow-neutral-600',
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-800',
      border: 'border-gray-800',
      shadow: 'shadow-gray-300',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.dark;

  return (
    <div
      className={`
        p-6 rounded-lg shadow-lg shadow-slate-400
        ${currentTheme.bg} 
        ${currentTheme.text} 
        ${currentTheme.shadow}
        ${center ? 'text-center' : 'text-left'}
        ${className}
      `}
    >
      {/* First line of text - optional */}
      {first && (
        <div className="text-lg md:text-2xl lg:text-4xl font-semibold mb-2">
          {first}
        </div>
      )}

      {/* Second line of text - optional */}
      {second && (
        <div
          className={`text-2xl md:text-4xl lg:text-6xl font-extrabold ${
            first ? 'mt-2' : ''
          }`}
        >
          <span className={`pb-1 border-b-2 ${currentTheme.border}`}>
            {second}
          </span>
        </div>
      )}
    </div>
  );
};

export default Heading;
