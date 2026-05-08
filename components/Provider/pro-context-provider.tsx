import { PetRepository } from "@/db/repositories/pet-repository";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./auth-provider";

type ContextProps = {
  isProUser: boolean;
  aiPhotoAnalysisAllowed?: boolean;
};

const ProContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const ProContextProvider = (props: Props) => {
  const { user } = useContext(AuthContext);
  const isProUser = false;
  const [aiPhotoAnalysisAllowed, setAiPhotoAnalysisAllowed] =
    useState<boolean>(false);

  const checkPhotoAnalysisAllowed = useCallback(() => {
    if (isProUser) {
      setAiPhotoAnalysisAllowed(true);
      return;
    }

    if (user?.id) {
      const repository = new PetRepository();
      repository.getPets(user.id).then((pets) => {
        if (pets.length > 0) {
          const usedAiFeature = pets.some(
            (pet) => pet.petDescriptionId !== null,
          );
          setAiPhotoAnalysisAllowed(!usedAiFeature);
        } else {
          setAiPhotoAnalysisAllowed(true);
        }
      });
    }
  }, [isProUser, user?.id]);

  useEffect(() => {
    checkPhotoAnalysisAllowed();
  }, [checkPhotoAnalysisAllowed]);

  return (
    <ProContext.Provider
      value={{
        isProUser,
        aiPhotoAnalysisAllowed,
      }}
    >
      {props.children}
    </ProContext.Provider>
  );
};

export function useProContext() {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error("Context unavailable.");
  return ctx;
}

export { ProContext, ProContextProvider };
