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
  multiPhotoUploadAllowed?: boolean;
};

const ProContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const ProContextProvider = (props: Props) => {
  const { user } = useContext(AuthContext);
  const isProUser = true;
  const [aiPhotoAnalysisAllowed, setAiPhotoAnalysisAllowed] =
    useState<boolean>(false);
  const [multiPhotoUploadAllowed, setMultiPhotoUploadAllowed] =
    useState<boolean>(false);

  const checkPhotoAnalysisAllowed = useCallback(() => {
    if (isProUser) {
      setAiPhotoAnalysisAllowed(true);
      return;
    }

    if (user?.id) {
      const repository = new PetRepository();
      repository
        .getPets(user.id)
        .then((pets) => {
          if (pets.length > 0) {
            const usedAiFeature = pets.some((pet) => !!pet.petDescriptionId);
            setAiPhotoAnalysisAllowed(!usedAiFeature);
          } else {
            setAiPhotoAnalysisAllowed(true);
          }
        })
        .catch(() => {
          setAiPhotoAnalysisAllowed(true);
        });
    } else {
      setAiPhotoAnalysisAllowed(true);
    }
  }, [isProUser, user?.id]);

  const checkMultiPhotoUploadAllowed = useCallback(() => {
    if (isProUser) {
      setMultiPhotoUploadAllowed(true);
    } else {
      setMultiPhotoUploadAllowed(false);
    }
  }, [isProUser]);

  useEffect(() => {
    checkPhotoAnalysisAllowed();
  }, [checkPhotoAnalysisAllowed]);

  useEffect(() => {
    checkMultiPhotoUploadAllowed();
  }, [checkMultiPhotoUploadAllowed]);

  return (
    <ProContext.Provider
      value={{
        isProUser,
        aiPhotoAnalysisAllowed,
        multiPhotoUploadAllowed,
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
