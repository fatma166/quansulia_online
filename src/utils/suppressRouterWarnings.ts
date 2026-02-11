export const suppressRouterWarnings = () => {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: Received `true` for a non-boolean attribute `jsx`')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
};
