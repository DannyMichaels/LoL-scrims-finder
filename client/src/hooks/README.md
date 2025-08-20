# useCountdown Hook

A React hook for creating countdown timers that calculate days, hours, minutes, and seconds remaining until a target date.

## Usage

```javascript
import useCountdown from '@/hooks/useCountdown';

function MyComponent() {
  const {
    timerDays,
    timerHours,
    timerMinutes,
    timerSeconds,
    isTimerStarted
  } = useCountdown('2024-12-31T23:59:59Z', () => {
    console.log('Countdown finished!');
  });

  return (
    <div>
      {isTimerStarted ? (
        <div>
          {timerDays}d {timerHours}h {timerMinutes}m {timerSeconds}s
        </div>
      ) : (
        <div>Timer not started</div>
      )}
    </div>
  );
}
```

## Parameters

- **`dateToCountdownFrom`** (string | Date): The target date/time to count down to
- **`onComplete`** (function, optional): Callback function executed when countdown reaches zero

## Return Values

- **`isTimerStarted`** (boolean): Whether the countdown has been initialized
- **`timerDays`** (number): Days remaining
- **`timerHours`** (number): Hours remaining (0-23)
- **`timerMinutes`** (number): Minutes remaining (0-59)
- **`timerSeconds`** (number): Seconds remaining (0-59)

## Features

- **Automatic cleanup**: Clears interval when component unmounts
- **Real-time updates**: Updates every second
- **Completion callback**: Executes callback when countdown reaches zero
- **Negative time handling**: Stops at zero, doesn't go negative

## Implementation Details

The hook uses `setInterval` to update the countdown every 1000ms (1 second). It calculates the difference between the target date and current time, then breaks it down into days, hours, minutes, and seconds using modular arithmetic.

### Time Constants Used:
- `ONE_SECOND_IN_MS = 1000`
- `ONE_MINUTE_IN_MS = 1000 * 60`
- `ONE_HOUR_IN_MS = 1000 * 60 * 60`
- `ONE_DAY_IN_MS = 1000 * 60 * 60 * 24`

## Example Use Cases

- **Scrim start timers**: Count down to game start time
- **Event countdowns**: Time until tournaments begin
- **Session expiration**: Time until user session expires
- **Limited time offers**: Sales or promotion timers