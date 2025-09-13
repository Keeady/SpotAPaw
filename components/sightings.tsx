import * as React from "react";
import {
  Avatar,
  Card,
  Text,
} from "react-native-paper";

export default function Sightings() {
    return (
        <Card>
        <Card.Title
          title="Recent Sightings"
          subtitle="Track where your pet has been spotted on the map"
          left={(props) => <Avatar.Icon {...props} icon="map-marker-outline" />}
        />
        <Card.Content>
          <Text variant="labelLarge">Map Placeholder</Text>
        </Card.Content>
      </Card>
    )
}