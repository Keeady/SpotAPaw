"use client"
import { useState } from "react";

export default function useLocationStorage(key: string) {
    const [value, setValue] = useState(() => {});
    

    return [value, setValue]
}