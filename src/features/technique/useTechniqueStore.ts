"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_TECHNIQUE_STORE,
  loadTechniqueStore,
  saveTechniqueStore,
} from "./storage.ts";
import type { TechniqueStoreData } from "./types.ts";

export function useTechniqueStore() {
  const [data, setData] = useState<TechniqueStoreData>(
    DEFAULT_TECHNIQUE_STORE,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Browser storage is intentionally hydrated after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadTechniqueStore(window.localStorage));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTechniqueStore(window.localStorage, data);
  }, [data, loaded]);

  return { data, setData, loaded };
}
