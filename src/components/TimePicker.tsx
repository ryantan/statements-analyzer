import * as React from 'react';

import type { PickerProps } from 'antd/es/date-picker/generatePicker';
import { PickerRef } from 'rc-picker';

import DatePicker from './DatePicker';

export type TimePickerProps = Omit<PickerProps<Date>, 'picker'>;

const TimePicker = React.forwardRef<PickerRef, TimePickerProps>(
  (props, ref) => (
    <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
  )
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;
