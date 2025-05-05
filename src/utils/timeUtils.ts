
/**
 * Format seconds into a readable time string (MM:SS.ms or HH:MM:SS.ms)
 */
export const formatTime = (totalMilliseconds: number): string => {
  const milliseconds = Math.floor(totalMilliseconds % 1000);
  const seconds = Math.floor(totalMilliseconds / 1000) % 60;
  const minutes = Math.floor(totalMilliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
  
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  const paddedMilliseconds = String(milliseconds).padStart(3, '0');
  
  return hours > 0 
    ? `${hours}:${paddedMinutes}:${paddedSeconds}.${paddedMilliseconds}`
    : `${paddedMinutes}:${paddedSeconds}.${paddedMilliseconds}`;
};
