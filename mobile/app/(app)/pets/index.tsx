import { log } from "@/components/logs";
import PetListRenderer from "@/components/pets/pet-list";
import { AuthContext } from "@/components/Provider/auth-provider";
import { createErrorLogMessage } from "@/components/util";
import { SightingPet } from "@/components/wizard/wizard-interface";
import { PetRepository } from "@/db/repositories/pet-repository";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";

export default function PetListScreen() {
  const [pets, setPets] = useState<SightingPet[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation("petprofile");

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      const petRepository = new PetRepository();

      petRepository
        .getPets(user.id)
        .then((data) => {
          if (data && data.length > 0) {
            setPets(data);
          }
        })
        .catch((error) => {
          const errorMessage = createErrorLogMessage(error);
          log(`getPets: Error fetching pet info ${errorMessage}`);
          showMessage({
            message: t("errorFetchingPetsInfo", "Error fetching pets info."),
            type: "warning",
            icon: "warning",
            statusBarHeight: 50,
          });
        }).finally(() => {
          setLoading(false);
        });
    }
  }, [user?.id]);

  if (loading) {
    return null;
  }

  return <PetListRenderer pets={pets} />;
}
