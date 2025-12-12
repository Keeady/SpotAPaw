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
  const [d, setDate] = useState(value);
  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDate(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
      onChange(newDate);
      setDate(newDate);
    }
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTime(false);
    if (selectedTime) {
      const newDate = new Date(value);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      onChange(newDate);
      setDate(newDate);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Button
        icon={"calendar"}
        mode={"contained"}
        onPress={() => setShowDate(true)}
        style={styles.button}
      >
        Date: {d.toLocaleDateString()}
      </Button>
      <Button
        icon={"clock"}
        mode={"contained"}
        onPress={() => setShowTime(true)}
        style={styles.button}
      >
        Time: {d.toLocaleTimeString()}
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
