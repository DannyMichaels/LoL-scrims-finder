import Tooltip from '@mui/material/Tooltip';

// Custom Tooltip now just uses the MUI Tooltip with theme styles
// The theme handles all styling consistently
export default function CustomTooltip(props) {
  // Pass through all props to MUI Tooltip
  // Theme styles from appTheme.js will be applied automatically
  return (
    <Tooltip
      arrow
      placement={props.placement ?? 'top'}
      {...props}
    />
  );
}
