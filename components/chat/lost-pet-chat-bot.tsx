import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  Keyboard,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { getCurrentUserLocationV3 } from "../get-current-location";
import { AuthContext } from "@/components/Provider/auth-provider";
import { saveChatBotSighting } from "../sightings/sightings-crud";
import { PetReportData } from "../sightings/sighting-interface";
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
  uploadOrTakePhoto,
} from "../image-picker";
import useUploadPetImageUrl from "../image-upload";
import { useLocalSearchParams, useRouter } from "expo-router";
import { log } from "../logs";

type ChatBotActionButton = {
  label: string;
  icon: string;
  showMap?: boolean;
  action: string;
};

type ChatBotQuickReplies = {
  value: string;
  text: string;
};

type ChatBotMessage = {
  id: number;
  text: string;
  type: string;
  actionButton?: ChatBotActionButton;
  quickReplies: ChatBotQuickReplies[];
};

const LostPetChatbot = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const sightingsRoute = user ? "my-sightings" : "sightings";
  const { sightingId: linkedSightingId, petId } = useLocalSearchParams<{
    sightingId: string;
    petId: string;
  }>();

  const uploadImage = useUploadPetImageUrl();

  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const [behavior, setBehavior] = useState<"padding" | undefined>("padding");
  const [messages, setMessages] = useState<ChatBotMessage[]>([]);
  const [input, setInput] = useState("");
  const [reportData, setReportData] = useState<PetReportData>({
    petId: null,
    petType: null,
    petName: null,
    breed: null,
    color: null,
    size: null,
    lastSeenLocationLat: null,
    lastSeenLocationLng: null,
    lastSeenLocation: null,
    lastSeenTime: null,
    distinctiveFeatures: null,
    photo: null,
    contactName: null,
    contactPhone: null,
    petBehavior: null,
    hasCollar: null,
    gender: null,
    notes: null,
    collarDescription: null,
    linkedSightingId: null,
  });
  const [currentStep, setCurrentStep] = useState("greeting");
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 47.3073,
    longitude: -122.2284,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestPermissions();
    addBotMessage("Hello! I can help you report a lost pet. Are you:", [
      { text: "Missing my pet", value: "lost_own" },
      { text: "Found a lost pet", value: "found_stray" },
    ]);
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setBehavior("padding");
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setBehavior(undefined);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const requestPermissions = async () => {
    getCurrentUserLocationV3()
      .then((location) => {
        if (location) {
          setMapRegion({
            latitude: location?.lat,
            longitude: location?.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      })
      .catch((e) => {
        log(`requestPermissions: ${e}`);
      });
    await requestCameraPermission().catch((e) => {
      log(`requestPermissions: ${e}`);
    });
    await requestMediaLibraryPermission().catch((e) => {
      log(`requestPermissions: ${e}`);
    });
  };

  const addBotMessage = (
    text: string,
    quickReplies: ChatBotQuickReplies[] = [],
    actionButton?: ChatBotActionButton
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "bot",
        text,
        quickReplies,
        actionButton,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text,
        quickReplies: [],
      },
    ]);
  };

  const handleQuickReply = (value: string, label: string) => {
    addUserMessage(label);
    processResponse(value);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addUserMessage(input);
    processResponse(input);
    setInput("");
  };

  const processResponse = async (response: string) => {
    switch (currentStep) {
      case "greeting":
        if (response === "lost_own") {
          setCurrentStep("petType");
          setTimeout(() => {
            addBotMessage(
              "I'm so sorry to hear your pet is missing. What type of pet are you looking for?",
              [
                { text: "Dog", value: "Dog" },
                { text: "Cat", value: "Cat" },
                { text: "Other", value: "Other" },
              ]
            );
          }, 500);
        } else {
          setCurrentStep("foundPetType");
          setTimeout(() => {
            addBotMessage(
              "Thank you for helping bring our furry friends home! What type of pet did you find?",
              [
                { text: "Dog", value: "Dog" },
                { text: "Cat", value: "Cat" },
                { text: "Other", value: "Other" },
              ]
            );
          }, 500);
        }
        break;

      case "petType":
        setReportData((prev) => ({ ...prev, petType: response }));
        setCurrentStep("name");
        setTimeout(() => {
          addBotMessage("What's your pet's name?");
        }, 500);
        break;

      case "foundPetType":
        setReportData((prev) => ({ ...prev, petType: response }));
        setCurrentStep("foundBreed");
        setTimeout(() => {
          addBotMessage(
            "Can you describe the pet's breed or what they look like?"
          );
        }, 500);
        break;

      case "foundBreed":
        setReportData((prev) => ({ ...prev, breed: response }));
        setCurrentStep("foundColor");
        setTimeout(() => {
          addBotMessage(
            "What color is the pet? Include any markings or patterns."
          );
        }, 500);
        break;

      case "foundColor":
        setReportData((prev) => ({ ...prev, color: response }));
        setCurrentStep("foundSize");
        setTimeout(() => {
          addBotMessage("How would you describe their size?", [
            { text: "Small (under 20 lbs)", value: "small" },
            { text: "Medium (20-50 lbs)", value: "medium" },
            { text: "Large (over 50 lbs)", value: "large" },
            { text: "X-Large (over 100 lbs)", value: "X-Large" },
          ]);
        }, 500);
        break;

      case "foundSize":
        setReportData((prev) => ({ ...prev, size: response }));
        setCurrentStep("foundCollar");
        setTimeout(() => {
          addBotMessage(
            "Does your pet have any collars, tags, or harness on?",
            [
              { text: "Yes, has collar", value: "yes_collar" },
              { text: "Yes, has harness", value: "yes_collar" },
              { text: "Yes, has tags", value: "yes_tags" },
              { text: "None", value: "no" },
            ]
          );
        }, 500);
        break;

      case "foundCollar":
        if (response !== "no") {
          setReportData((prev) => ({ ...prev, hasCollar: response }));
          setCurrentStep("collarDescription");
          setTimeout(() => {
            addBotMessage(
              "Please describe (colors, numbers, markings, brand, etc.)"
            );
          }, 500);
        } else {
          setCurrentStep("foundBehavior");
          setTimeout(() => {
            addBotMessage("How is the pet behaving?", [
              { text: "Friendly & approachable", value: "friendly" },
              { text: "Scared or skittish", value: "scared" },
              { text: "Aggressive or defensive", value: "aggressive" },
              { text: "Injured", value: "injured" },
            ]);
          }, 500);
        }

        break;

      case "collarDescription":
        setReportData((prev) => ({ ...prev, collarDescription: response }));
        setCurrentStep("foundBehavior");
        setTimeout(() => {
          addBotMessage("How is your pet behaving?", [
            { text: "Friendly & approachable", value: "friendly" },
            { text: "Scared or skittish", value: "scared" },
            { text: "Aggressive or defensive", value: "aggressive" },
            { text: "Injured", value: "injured" },
          ]);
        }, 500);
        break;

      case "foundBehavior":
        setReportData((prev) => ({ ...prev, petBehavior: response }));
        setCurrentStep("foundPhoto");
        setTimeout(() => {
          addBotMessage(
            "A photo would really help owners identify their pet. Can you take a picture?",
            [
              { text: "I'll take one", value: "will_take" },
              { text: "Can't take photo", value: "no_photo" },
            ],
            {
              label: "Take Photo",
              icon: "camera",
              action: "uploadPhoto",
            }
          );
        }, 500);
        break;

      case "foundPhoto":
        if (
          response === "photo_uploaded" ||
          response === "no_photo" ||
          response.toLowerCase().includes("skip") ||
          response.toLowerCase().includes("no") ||
          response.toLowerCase().includes("later")
        ) {
          setCurrentStep("foundFeatures");
          setTimeout(() => {
            addBotMessage(
              "Any distinctive features? (unique markings, scars, missing teeth, etc.)"
            );
          }, 500);
        } else if (response === "will_take") {
          setTimeout(() => {
            addBotMessage(
              "Great! Please use the button share a photo, or type 'skip' to continue without one.",
              [],
              {
                label: "Share Photo",
                icon: "image",
                action: "uploadPhoto",
              }
            );
          }, 500);
        }
        break;

      case "foundFeatures":
        setReportData((prev) => ({ ...prev, distinctiveFeatures: response }));
        setCurrentStep("foundLocation");
        setTimeout(() => {
          addBotMessage(
            "Where did you find this pet?",
            [
              { text: "Drop pin on map", value: "show_map" },
              { text: "I'll type it", value: "will_type" },
            ],
            {
              label: "Share My Location",
              icon: "crosshairs-gps",
              action: "shareLocation",
            }
          );
        }, 500);
        break;

      case "foundLocation":
        if (response === "show_map") {
          setTimeout(() => {
            addBotMessage(
              "Tap on the map to drop a pin where you found the pet.",
              [],
              {
                label: "Close Map",
                icon: "map",
                action: "closeMap",
                showMap: true,
              }
            );
          }, 500);
        } else if (
          response === "location_shared" ||
          response === "will_type" ||
          response.length > 5
        ) {
          if (response === "will_type") {
            setCurrentStep("typedLocation");
            setTimeout(() => {
              addBotMessage(
                "Please type the address or area where you found the pet."
              );
            }, 500);
          } else if (response === "location_shared") {
            setCurrentStep("foundTime");
            setTimeout(() => {
              addBotMessage("When did you find them?", [
                { text: "Just now", value: "now" },
                { text: "Within the hour", value: "1 hour ago" },
                { text: "Today", value: "today" },
                { text: "Yesterday", value: "yesterday" },
              ]);
            }, 500);
          } else {
            setReportData((prev) => ({ ...prev, lastSeenLocation: response }));
            setCurrentStep("foundTime");
            setTimeout(() => {
              addBotMessage("When did you find them?", [
                { text: "Just now", value: "now" },
                { text: "Within the hour", value: "1 hour ago" },
                { text: "Today", value: "today" },
                { text: "Yesterday", value: "yesterday" },
              ]);
            }, 500);
          }
        }
        break;

      case "typedLocation":
        setReportData((prev) => ({ ...prev, lastSeenLocation: response }));
        setCurrentStep("typedLandmark");
        setTimeout(() => {
          addBotMessage(
            "Please describe any landmarks around where you found the pet."
          );
        }, 500);

        break;

      case "typedLandmark":
        setReportData((prev) => ({
          ...prev,
          lastSeenLocation: prev.lastSeenLocation + " | " + response,
        }));
        setCurrentStep("foundTime");
        setTimeout(() => {
          addBotMessage("When did you find them?", [
            { text: "Just now", value: "now" },
            { text: "Within the hour", value: "1 hour ago" },
            { text: "Today", value: "today" },
            { text: "Yesterday", value: "yesterday" },
          ]);
        }, 500);
        break;

      case "foundTime":
        setReportData((prev) => ({ ...prev, lastSeenTime: response }));
        setCurrentStep("foundContact");
        setTimeout(() => {
          addBotMessage("What's your name?");
        }, 500);
        break;

      case "foundContact":
        setReportData((prev) => ({ ...prev, contactName: response }));
        setCurrentStep("foundPhone");
        setTimeout(() => {
          addBotMessage(
            "What's the best phone number for the owner to reach you?"
          );
        }, 500);
        break;

      case "foundPhone":
        setReportData((prev) => ({ ...prev, contactPhone: response }));
        setCurrentStep("saving");
        setTimeout(() => {
          const behaviorWarning =
            reportData.petBehavior === "injured"
              ? " Note: Since the pet appears injured, please consider contacting local animal control or a vet."
              : reportData.petBehavior === "aggressive"
              ? " Note: Since the pet seems defensive, please keep a safe distance."
              : "";

          if (behaviorWarning) {
            addBotMessage(`${behaviorWarning}`);
          }
        }, 500);
        break;

      case "name":
        setReportData((prev) => ({ ...prev, petName: response }));
        setCurrentStep("breed");
        setTimeout(() => {
          addBotMessage(
            `Got it. What breed is ${response}? (If mixed or unknown, just describe them)`
          );
        }, 500);
        break;

      case "breed":
        setReportData((prev) => ({ ...prev, breed: response }));
        setCurrentStep("color");
        setTimeout(() => {
          addBotMessage(
            "What color(s) is your pet? Include any markings or patterns."
          );
        }, 500);
        break;

      case "color":
        setReportData((prev) => ({ ...prev, color: response }));
        setCurrentStep("size");
        setTimeout(() => {
          addBotMessage("How would you describe their size?", [
            { text: "Small (under 20 lbs)", value: "small" },
            { text: "Medium (20-50 lbs)", value: "medium" },
            { text: "Large (over 50 lbs)", value: "large" },
            { text: "X-Large (over 100 lbs)", value: "xlarge" },
          ]);
        }, 500);
        break;

      case "size":
        setReportData((prev) => ({ ...prev, size: response }));
        setCurrentStep("photo");
        setTimeout(() => {
          addBotMessage(
            "A clear photo will greatly help in finding your pet. Do you have a recent photo you can upload?",
            [{ text: "No photo available", value: "no_photo" }],
            {
              label: "Upload Photo",
              icon: "camera",
              action: "uploadPhoto",
            }
          );
        }, 500);
        break;

      case "photo":
        if (
          response === "photo_uploaded" ||
          response === "no_photo" ||
          response.toLowerCase().includes("skip") ||
          response.toLowerCase().includes("no") ||
          response.toLowerCase().includes("later")
        ) {
          setCurrentStep("features");
          setTimeout(() => {
            addBotMessage(
              "Are there any distinctive features that would help identify your pet? (scars, collar, tags, unique markings, etc.)"
            );
          }, 500);
        } else if (response === "will_upload") {
          setTimeout(() => {
            addBotMessage(
              "Great! Please use the button above to upload the photo, or type 'skip' to continue without one."
            );
          }, 500);
        }
        break;

      case "features":
        setReportData((prev) => ({ ...prev, distinctiveFeatures: response }));
        setCurrentStep("collar");
        setTimeout(() => {
          addBotMessage("Does your pet have any collar, tags, or harness on?", [
            { text: "Yes, has collar", value: "yes_collar" },
            { text: "Yes, has harness", value: "yes_collar" },
            { text: "Yes, has tags", value: "yes_tags" },
            { text: "None", value: "no" },
          ]);
        }, 500);
        break;

      case "collar":
        if (response !== "no") {
          setReportData((prev) => ({ ...prev, hasCollar: response }));
          setCurrentStep("collarTagHarnessDescription");
          setTimeout(() => {
            addBotMessage(
              "Please describe (colors, numbers, markings, brand, etc.)"
            );
          }, 500);
        } else {
          setCurrentStep("gender");
          setTimeout(() => {
            addBotMessage("What is the gender of your pet?", [
              { text: "Female", value: "Female" },
              { text: "Male", value: "Male" },
              { text: "Not sure", value: "" },
            ]);
          }, 500);
        }

        break;

      case "collarTagHarnessDescription":
        setReportData((prev) => ({ ...prev, collarDescription: response }));
        setCurrentStep("behavior");
        setTimeout(() => {
          addBotMessage("How is the pet behaving?", [
            { text: "Friendly & approachable", value: "friendly" },
            { text: "Scared or skittish", value: "scared" },
            { text: "Aggressive or defensive", value: "aggressive" },
            { text: "Injured", value: "injured" },
          ]);
        }, 500);

        break;

      case "behavior":
        setReportData((prev) => ({ ...prev, petBehavior: response }));

        setCurrentStep("gender");
        setTimeout(() => {
          addBotMessage("What gender is your pet (Female/Male)?");
        }, 500);
        break;

      case "gender":
        setReportData((prev) => ({ ...prev, gender: response }));
        setCurrentStep("location");
        setTimeout(() => {
          addBotMessage(
            "Where was your pet last seen?",
            [
              { text: "Drop pin on map", value: "show_map" },
              { text: "I'll type it", value: "will_type" },
            ],
            {
              label: "Share My Location",
              icon: "crosshairs-gps",
              action: "shareLocation",
            }
          );
        }, 500);
        break;

      case "location":
        if (response === "show_map") {
          setTimeout(() => {
            addBotMessage(
              "Tap on the map to drop a pin where your pet was last seen.",
              [],
              {
                label: "Close Map",
                icon: "map",
                action: "closeMap",
                showMap: true,
              }
            );
          }, 500);
        } else if (
          response === "location_shared" ||
          response === "will_type" ||
          response.length > 5
        ) {
          if (response === "will_type") {
            setTimeout(() => {
              addBotMessage(
                "Please type the address or area where your pet was last seen."
              );
            }, 500);
          } else if (response === "location_shared") {
            setCurrentStep("time");
            setTimeout(() => {
              addBotMessage("When did you last see your pet?", [
                { text: "Within the last hour", value: "1 hour ago" },
                { text: "Today", value: "today" },
                { text: "Yesterday", value: "yesterday" },
                { text: "2 days ago", value: "2 days ago" },
                { text: "More than 2 days ago", value: "3 days ago" },
              ]);
            }, 500);
          } else {
            setReportData((prev) => ({ ...prev, lastSeenLocation: response }));
            setCurrentStep("time");
            setTimeout(() => {
              addBotMessage("When did you last see your pet?", [
                { text: "Within the last hour", value: "1 hour ago" },
                { text: "Today", value: "today" },
                { text: "Yesterday", value: "yesterday" },
                { text: "2 days ago", value: "2 days ago" },
                { text: "More than 2 days ago", value: "3 days ago" },
              ]);
            }, 500);
          }
        }
        break;

      case "time":
        setReportData((prev) => ({ ...prev, lastSeenTime: response }));
        setCurrentStep("contact");
        setTimeout(() => {
          addBotMessage("What's your name?");
        }, 500);
        break;

      case "contact":
        setReportData((prev) => ({ ...prev, contactName: response }));
        setCurrentStep("phone");
        setTimeout(() => {
          addBotMessage("What's the best phone number to reach you at?");
        }, 500);
        break;

      case "phone":
        setReportData((prev) => ({ ...prev, contactPhone: response }));
        setCurrentStep("saving");
        break;

      case "complete":
        if (response.startsWith("view_report")) {
          const reportId = response.replace("view_report-", "");
          router.replace(`/${sightingsRoute}/${reportId}`);
          return;
        } else if (response === "done") {
          resetChat();
        } else if (response === "try_again") {
          setCurrentStep("saving");
        }
        break;

      case "saving":
        saveChatBotSighting(
          { ...reportData, petId, linkedSightingId },
          uploadImage,
          (result) => {
            setCurrentStep("complete");
            if (result) {
              const { error, reportId } = result;
              if (error) {
                log(error);
                setTimeout(() => {
                  addBotMessage(`${error}`, [
                    { text: "Try Again", value: "try_again" },
                    { text: "Done", value: "done" },
                  ]);
                }, 500);
              }

              if (reportId) {
                if (reportData.petName) {
                  setTimeout(() => {
                    addBotMessage(
                      `Thank you, ${reportData.contactName}. I've collected all the information. Your lost pet report for ${reportData.petName} has been created. We'll notify nearby users. Keep checking back for any updates.`,
                      [
                        {
                          text: "View Report",
                          value: `view_report-${reportId}`,
                        },
                        { text: "Done", value: "done" },
                      ]
                    );
                  }, 500);
                } else {
                  setTimeout(() => {
                    addBotMessage(
                      `Thank you so much for helping, ${reportData.contactName}! Your report has been created and we'll notify nearby owners looking for lost pets.`,
                      [
                        {
                          text: "View Report",
                          value: `view_report-${reportId}`,
                        },
                        { text: "Done", value: "done" },
                      ]
                    );
                  }, 500);
                }
              }
            }
          },
          user?.id
        );
        break;
      default:
        break;
    }
  };

  const handleActionButton = async (action: string) => {
    if (action === "uploadPhoto") {
      await uploadOrTakePhoto((result) => {
        if (result) {
          addUserMessage("📷 Photo uploaded");
          setReportData((prev) => ({ ...prev, photo: result }));
          if (currentStep === "photo" || currentStep === "foundPhoto") {
            processResponse("photo_uploaded");
          }
        }
      });
    } else if (action === "shareLocation") {
      try {
        const location = await getCurrentUserLocationV3();
        addUserMessage(`📍 Location saved`);
        setReportData((prev) => ({
          ...prev,
          lastSeenLocationLat: location?.lat,
          lastSeenLocationLng: location?.lng,
          lastSeenLocation: "",
        }));
        processResponse("location_shared");
      } catch (error) {
        log(`getCurrentUserLocationV3: ${error}`);
        addBotMessage(
          "Unable to get your location. Please enable location or type the address instead.",
          [{ text: "I'll type it", value: "will_type" }],
          {
            label: "Enable location sharing",
            icon: "map-marker",
            action: "enableLocation",
          }
        );
      }
    } else if (action === "closeMap") {
      if (selectedLocation) {
        addUserMessage(
          `📍 Pin dropped at (${selectedLocation.latitude.toFixed(
            6
          )}, ${selectedLocation.longitude.toFixed(6)})`
        );

        setReportData((prev) => ({
          ...prev,
          lastSeenLocationLat: selectedLocation.latitude,
          lastSeenLocationLng: selectedLocation.longitude,
          lastSeenLocation: "",
        }));

        if (currentStep === "location") {
          setCurrentStep("time");
          setTimeout(() => {
            addBotMessage("When did you last see your pet?", [
              { text: "Within the last hour", value: "1 hour ago" },
              { text: "Today", value: "today" },
              { text: "Yesterday", value: "yesterday" },
              { text: "2 days ago", value: "2 days ago" },
              { text: "More than 2 days ago", value: "3 days ago" },
            ]);
          }, 500);
        } else if (currentStep === "foundLocation") {
          setCurrentStep("foundTime");
          setTimeout(() => {
            addBotMessage("When did you find the pet?", [
              { text: "Just now", value: "now" },
              { text: "Within the hour", value: "1 hour ago" },
              { text: "Today", value: "today" },
              { text: "Yesterday", value: "yesterday" },
            ]);
          }, 500);
        }
        setSelectedLocation(null);
      }
    } else if (action === "enableLocation") {
      getCurrentUserLocationV3()
        .then((location) => {
          if (location) {
            setMapRegion({
              latitude: location?.lat,
              longitude: location?.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        })
        .catch((err) => {
          log(`getCurrentUserLocationV3: ${err}`);
          addBotMessage(
            "Unable to get your location. Please type the address instead.",
            [{ text: "I'll type it", value: "will_type" }]
          );
        });
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const resetChat = () => {
    setMessages([]);
    setReportData({
      petId: null,
      petType: null,
      petName: null,
      breed: null,
      color: null,
      size: null,
      lastSeenLocationLat: null,
      lastSeenLocationLng: null,
      lastSeenLocation: null,
      lastSeenTime: null,
      distinctiveFeatures: null,
      photo: null,
      contactName: null,
      contactPhone: null,
      petBehavior: null,
      hasCollar: null,
      gender: null,
      notes: null,
      collarDescription: null,
      linkedSightingId: null,
    });
    setCurrentStep("greeting");

    // Restart the conversation
    setTimeout(() => {
      addBotMessage("Hello! I can help you report a pet. Are you:", [
        { text: "Missing my pet", value: "lost_own" },
        { text: "Found a stray pet", value: "found_stray" },
      ]);
    }, 500);
  };

  useEffect(() => {
    if (currentStep === "saving") {
      processResponse(currentStep);
    }
  }, [currentStep]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Lost Pet Report</Text>
        <Text style={styles.headerSubtitle}>We help bring pets back home</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg: ChatBotMessage) => (
          <View key={msg.id} style={styles.messageWrapper}>
            <View
              style={[
                styles.messageBubble,
                msg.type === "user"
                  ? [styles.userBubble, { backgroundColor: primaryColor }]
                  : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.type === "user" ? styles.userText : styles.botText,
                ]}
              >
                {msg.text}
              </Text>
            </View>

            {msg.actionButton && (
              <View style={styles.actionButtonContainer}>
                {msg.actionButton.showMap ? (
                  <Card style={styles.mapCard}>
                    <MapView
                      style={styles.map}
                      initialRegion={mapRegion}
                      onRegionChangeComplete={setMapRegion}
                      onPress={handleMapPress}
                      provider={PROVIDER_GOOGLE}
                    >
                      {selectedLocation && (
                        <Marker
                          coordinate={selectedLocation}
                          title="Selected Location"
                          pinColor="red"
                        />
                      )}
                    </MapView>
                    <Card.Content style={styles.mapFooter}>
                      <Text style={styles.mapFooterText}>
                        {selectedLocation
                          ? "Pin placed! Tap button to confirm."
                          : "Tap the map to place a pin"}
                      </Text>
                      <Button
                        mode="contained"
                        onPress={() =>
                          handleActionButton(msg.actionButton?.action || "")
                        }
                        disabled={!selectedLocation}
                        style={styles.confirmButton}
                      >
                        Confirm Location
                      </Button>
                    </Card.Content>
                  </Card>
                ) : (
                  <Button
                    mode="contained"
                    icon={msg.actionButton.icon}
                    onPress={() =>
                      handleActionButton(msg.actionButton?.action || "")
                    }
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.tertiary },
                    ]}
                  >
                    {msg.actionButton.label}
                  </Button>
                )}
              </View>
            )}

            {msg.quickReplies && (
              <View style={styles.quickRepliesContainer}>
                {msg.quickReplies.map((reply, idx) => (
                  <Chip
                    key={idx}
                    mode="outlined"
                    onPress={() => handleQuickReply(reply.value, reply.text)}
                    style={[
                      styles.quickReplyChip,
                      { borderColor: primaryColor },
                    ]}
                    textStyle={styles.quickReplyText}
                  >
                    {reply.text}
                  </Chip>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <RNTextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <IconButton
          icon="send"
          size={24}
          iconColor="#fff"
          style={[styles.sendButton, { backgroundColor: primaryColor }]}
          onPress={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#714ea9ff",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#BBDEFB",
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#2196F3",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#333",
  },
  actionButtonContainer: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
  },
  mapCard: {
    width: 320,
    marginTop: 8,
  },
  map: {
    width: "100%",
    height: 250,
  },
  mapFooter: {
    paddingVertical: 12,
  },
  mapFooterText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  confirmButton: {
    marginTop: 4,
  },
  quickRepliesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  quickReplyChip: {
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  quickReplyText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    margin: 0,
  },
});

export default LostPetChatbot;
