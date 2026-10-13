import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  active: boolean;
  alive: boolean;
  hasMultipleBirth: boolean;
  multipleBirthOrder: number | null;
}

export interface PatientRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  active: boolean;
  alive: boolean;
  hasMultipleBirth: boolean;
  multipleBirthOrder?: number | null;
}

const API_URL = "/api/v1/patients";
const ACTOR_ID_HEADER = "ACTOR_ID";

export function usePatients() {
  const { userId } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ensure a logged-in user is available for write operations.
   */
  const getActorId = useCallback((): string => {
    if (!userId) {
      throw new Error(
        "Unable to identify the authenticated user. Please sign in again."
      );
    }

    return userId;
  }, [userId]);

  /**
   * Common HTTP request handler.
   */
  const request = useCallback(
    async <T,>(
      url: string,
      options: RequestInit = {}
    ): Promise<T> => {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
          const responseText = await response.text();

          if (responseText) {
            message = responseText;
          }
        } catch {
          // Keep the default error message if the response cannot be read.
        }

        throw new Error(message);
      }

      if (response.status === 204 || response.status === 205) {
        return undefined as T;
      }

      return (await response.json()) as T;
    },
    []
  );

  /**
   * Handle loading state and errors consistently.
   */
  const execute = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        return await action();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * GET /api/v1/patients
   */
  const fetchPatients = useCallback(
    () =>
      execute(async () => {
        const data = await request<Patient[]>(API_URL);

        setPatients(data);

        return data;
      }),
    [execute, request]
  );

  /**
   * GET /api/v1/patients/{id}
   */
  const fetchPatientById = useCallback(
    (id: string) =>
      execute(async () => {
        const data = await request<Patient>(
          `${API_URL}/${encodeURIComponent(id)}`
        );

        setPatient(data);

        return data;
      }),
    [execute, request]
  );

  /**
   * GET /api/v1/patients/number/{patientNumber}
   */
  const fetchPatientByNumber = useCallback(
    (patientNumber: string) =>
      execute(async () => {
        const data = await request<Patient>(
          `${API_URL}/number/${encodeURIComponent(patientNumber)}`
        );

        setPatient(data);

        return data;
      }),
    [execute, request]
  );

  /**
   * POST /api/v1/patients
   */
  const createPatient = useCallback(
    (data: PatientRequest) =>
      execute(async () => {
        const actorId = getActorId();

        const created = await request<Patient>(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [ACTOR_ID_HEADER]: actorId,
          },
          body: JSON.stringify(data),
        });

        setPatients((previous) => [created, ...previous]);
        setPatient(created);

        return created;
      }),
    [execute, getActorId, request]
  );

  /**
   * PUT /api/v1/patients/{id}
   */
  const updatePatient = useCallback(
    (id: string, data: PatientRequest) =>
      execute(async () => {
        const actorId = getActorId();

        const updated = await request<Patient>(
          `${API_URL}/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              [ACTOR_ID_HEADER]: actorId,
            },
            body: JSON.stringify(data),
          }
        );

        setPatients((previous) =>
          previous.map((item) => (item.id === id ? updated : item))
        );

        setPatient((previous) =>
          previous?.id === id ? updated : previous
        );

        return updated;
      }),
    [execute, getActorId, request]
  );

  /**
   * DELETE /api/v1/patients/{id}
   */
  const deletePatient = useCallback(
    (id: string) =>
      execute(async () => {
        const actorId = getActorId();

        await request<void>(`${API_URL}/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            [ACTOR_ID_HEADER]: actorId,
          },
        });

        setPatients((previous) =>
          previous.filter((item) => item.id !== id)
        );

        setPatient((previous) =>
          previous?.id === id ? null : previous
        );
      }),
    [execute, getActorId, request]
  );

  return {
    patients,
    patient,
    loading,
    error,
    fetchPatients,
    fetchPatientById,
    fetchPatientByNumber,
    createPatient,
    updatePatient,
    deletePatient,
  };
}