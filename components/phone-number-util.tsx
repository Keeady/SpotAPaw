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
    invalidPhoneNumber: boolean,
  ) => void;
  showInvalidPhoneError?: boolean;
};

export default function PhoneNumberInput({
  onPhoneNumberChange,
  showInvalidPhoneError,
}: PhoneNumberInputProps) {
  const theme = useTheme();

  const [phone, setPhone] = useState("");
  const [hasPhoneError, setHasPhoneError] = useState(false);

  const debounceTimer = useRef<number>(null);

  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode>("US");

  useEffect(() => {
    let isValid = true;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (phone) {
        isValid = isValidPhoneNumber(phone, selectedCountryCode);
        setHasPhoneError(!isValid);
      } else {
        setHasPhoneError(false);
      }

      onPhoneNumberChange(phone, selectedCountryCode, isValid);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [phone, selectedCountryCode]);

  const countries = useMemo(() => {
    const allCountries = getCountries();
    return allCountries.map((countryCode) => ({
      code: countryCode,
      callingCode: `+${getCountryCallingCode(countryCode)}`,
      name: countryCode,
    }));
    // .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountryData = useMemo(() => {
    return (
      countries.find((c) => c.code === selectedCountryCode) || countries[0]
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
              mode="elevated"
              onPress={openMenu}
              style={[
                styles.countryButton,
                {
                  borderWidth: 2,
                  borderColor: hasPhoneError
                    ? theme.colors.error
                    : "transparent",
                },
              ]}
              contentStyle={styles.countryButtonContent}
            >
              {selectedCountryData.code} {selectedCountryData.callingCode}
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

        <TextInput
          label="Phone Number"
          left={<TextInput.Icon icon="phone" />}
          onChangeText={(text) => {
            setPhone(text);
          }}
          value={phone}
          placeholder="555-555-5555"
          autoCapitalize={"none"}
          mode="outlined"
          autoComplete="tel"
          keyboardType="phone-pad"
          error={hasPhoneError || !!showInvalidPhoneError}
          style={styles.phoneInput}
        />
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
  },
  countryButtonContent: {
    height: 56,
  },
  menuScroll: {
    maxHeight: 300,
  },
  phoneInput: {
    flex: 1,
  },
});
