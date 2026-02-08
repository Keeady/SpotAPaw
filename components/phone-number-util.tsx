import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "libphonenumber-js";

export type PhoneNumberInputProps = {
  onPhoneNumberChange: (
    phone: string,
    countryCode: CountryCode,
    isvalidPhoneNumber: boolean,
  ) => void;
  showInvalidPhoneError?: boolean;
  disabled: boolean;
  phoneCountryCode?: CountryCode;
  phone?: string;
};

export default function PhoneNumberInput({
  onPhoneNumberChange,
  showInvalidPhoneError,
  disabled,
  phoneCountryCode,
  phone,
}: PhoneNumberInputProps) {
  const defaultCountryCode = "US";
  const theme = useTheme();

  const [editedPhoneValue, setEditedPhoneValue] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>();

  const [hasPhoneError, setHasPhoneError] = useState(false);

  const debounceTimer = useRef<number>(null);

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    setEditedPhoneValue(phone || "");
  }, [phone]);

  useEffect(() => {
    setSelectedCountryCode(phoneCountryCode || defaultCountryCode);
  }, [phoneCountryCode]);

  useEffect(() => {
    let isValid = true;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (editedPhoneValue) {
        isValid = isValidPhoneNumber(editedPhoneValue, selectedCountryCode);
        setHasPhoneError(!isValid);
      } else {
        setHasPhoneError(false);
      }

      onPhoneNumberChange(
        editedPhoneValue,
        selectedCountryCode || defaultCountryCode,
        isValid,
      );
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [onPhoneNumberChange, editedPhoneValue, selectedCountryCode]);

  const countries = useMemo(() => {
    const allCountries = getCountries();
    return allCountries.map((countryCode) => ({
      code: countryCode,
      callingCode: `+${getCountryCallingCode(countryCode)}`,
      name: countryCode,
    }));
  }, []);

  const selectedCountryData = useMemo(() => {
    return (
      (selectedCountryCode &&
        countries.find((c) => c.code === selectedCountryCode)) ||
      countries[0]
    );
  }, [selectedCountryCode, countries]);

  const handleCountrySelect = (countryCode: CountryCode) => {
    setSelectedCountryCode(countryCode);
    closeMenu();
  };

  return (
    <View>
      <Text variant="labelSmall" style={{ color: theme.colors.error }}>
        {hasPhoneError
          ? "Invalid phone number and country code combination."
          : ""}
      </Text>

      <View style={styles.inputContainer}>
        <Menu
          key={menuVisible ? "visible" : "hidden"}
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button
              mode="outlined"
              onPress={openMenu}
              style={[
                styles.countryButton,
                {
                  borderWidth: hasPhoneError ? 2 : 1,
                  borderColor: hasPhoneError
                    ? theme.colors.error
                    : disabled
                      ? theme.colors.surfaceDisabled
                      : theme.colors.outline,
                },
              ]}
              contentStyle={styles.countryButtonContent}
              disabled={disabled}
              icon={"phone"}
            >
              {selectedCountryData.code}
            </Button>
          }
        >
          <ScrollView style={styles.menuScroll}>
            {countries.map((country, index) => (
              <React.Fragment key={country.code}>
                <Menu.Item
                  onPress={() => handleCountrySelect(country.code)}
                  title={`${country.code} ${country.callingCode}`}
                />
                {index < countries.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </ScrollView>
        </Menu>

        <View style={styles.phoneInput}>
          <TextInput
            label="Phone Number"
            onChangeText={(text) => {
              setEditedPhoneValue(text);
            }}
            value={editedPhoneValue}
            placeholder="555-555-5555"
            autoCapitalize={"none"}
            mode="outlined"
            autoComplete="tel"
            keyboardType="phone-pad"
            error={hasPhoneError || !!showInvalidPhoneError}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  countryButton: {
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 5,
  },
  countryButtonContent: {
    height: 50,
  },
  menuScroll: {
    maxHeight: 300,
    backgroundColor: "#fff",
  },
  phoneInput: {
    flexGrow: 1,
  },
});
