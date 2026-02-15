import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export default function DatePicker({
  dateLabel,
  timeLabel,
  value,
  onChange,
}: {
  dateLabel: string;
  timeLabel: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [showTime, setShowTime] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [currentDate, setDate] = useState(value);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDate(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(currentDate.getHours());
      newDate.setMinutes(currentDate.getMinutes());
      newDate.setSeconds(0);
      onChange(newDate);
      setDate(newDate);
    }
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTime(false);
    if (selectedTime) {
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      currentDate.setSeconds(0);
      onChange(currentDate);
      setDate(currentDate);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Button
        icon={"calendar"}
        mode="elevated"
        onPress={() => setShowDate(true)}
        style={styles.button}
      >
        Date: {currentDate.toLocaleDateString()}
      </Button>
      <Button
        icon={"clock"}
        mode="elevated"
        onPress={() => setShowTime(true)}
        style={styles.button}
      >
        Time: {currentDate.toLocaleTimeString()}
      </Button>
      {showDate && (
        <DateTimePicker
          value={value}
          mode={"date"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
      {showTime && (
        <DateTimePicker
          value={value}
          mode={"time"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
});
