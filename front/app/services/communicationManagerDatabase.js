const BACK_URL = import.meta.env.VITE_URL_BACK || "http://localhost:8000";

/* ------------------------------- ASSISTENCIA ------------------------------ */

export async function getAllAssistencies() {
  const response = await fetch(`${BACK_URL}/assistencies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtenir assistències: ${response.statusText}`);
  }

  return await response.json();
}

export async function getAssistenciaById(id) {
  const response = await fetch(`${BACK_URL}/assistencies/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir assistència per ID: ${response.statusText}`,
    );
  }

  return await response.json();
}

export async function getAssistenciesByTallerId(tallerId) {
  const response = await fetch(`${BACK_URL}/assistencies/taller/${tallerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir assistències del taller: ${response.statusText}`,
    );
  }
  return await response.json();
}

export async function createAssistencia(assistenciaData) {
  const response = await fetch(`${BACK_URL}/assistencies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(assistenciaData),
  });
  if (!response.ok) {
    throw new Error(`Error al crear assistència: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateAssistencia(assistenciaData) {
  const response = await fetch(`${BACK_URL}/assistencies`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(assistenciaData),
  });
  if (!response.ok) {
    throw new Error(`Error al actualitzar assistència: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteAssistencia(id) {
  const response = await fetch(`${BACK_URL}/assistencies/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al eliminar assistència: ${response.statusText}`);
  }
  return await response.json();
}

export async function afegirPersonalAssistencia(data) {
  const response = await fetch(`${BACK_URL}/assistencies/afegirPersonal`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(
      `Error al afegir personal a assistència: ${response.statusText}`,
    );
  }
  return await response.json();
}

/* ------------------------------- INSCRIPCIONS ------------------------------ */

export async function getAllInscripcions() {
  const response = await fetch(`${BACK_URL}/inscripcions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir inscripcions: ${response.statusText}`);
  }
  return await response.json();
}

export async function createInscripcion(inscripcionData) {
  const response = await fetch(`${BACK_URL}/inscripcions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(inscripcionData),
  });
  if (!response.ok) {
    throw new Error(`Error al crear inscripció: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteInscripcion(id) {
  const response = await fetch(`${BACK_URL}/inscripcions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al eliminar inscripció: ${response.statusText}`);
  }
  return await response.json();
}

export async function confirmarInscripciones(tallerId, inscripcionesAprobadas) {
  const response = await fetch(`${BACK_URL}/inscripcions/confirmar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tallerId,
      inscripcionesAprobadas,
    }),
  });
  if (!response.ok) {
    throw new Error(`Error al confirmar inscripcions: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateInscripcion(id, inscripcionData) {
  const response = await fetch(`${BACK_URL}/inscripcions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inscripcionData),
  });
  if (!response.ok) {
    throw new Error(`Error al actualitzar inscripció: ${response.statusText}`);
  }
  return await response.json();
}

export async function procesarInscripcions(periode) {
  const response = await fetch(`${BACK_URL}/inscripcions/procesar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      periode: parseInt(periode),
    }),
  });
  if (!response.ok) {
    throw new Error(`Error al processar inscripcions: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- INSTITUCIONS ------------------------------ */

export async function getAllInstitucions() {
  const response = await fetch(`${BACK_URL}/institucions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtenir institucions: ${response.statusText}`);
  }

  return await response.json();
}

export async function getInstitucionById(id) {
  const response = await fetch(`${BACK_URL}/institucions/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir institució per ID: ${response.statusText}`,
    );
  }
  return await response.json();
}

export async function createInstitucion(institucionData) {
  const response = await fetch(`${BACK_URL}/institucions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(institucionData),
  });
  if (!response.ok) {
    throw new Error(`Error al crear institució: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateInstitucion(id, institucionData) {
  const response = await fetch(`${BACK_URL}/institucions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(institucionData),
  });
  if (!response.ok) {
    throw new Error(`Error al actualitzar institució: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteInstitucion(id) {
  const response = await fetch(`${BACK_URL}/institucions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al eliminar institució: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- TALLERS ------------------------------ */

export async function getAllTallers() {
  const response = await fetch(`${BACK_URL}/tallers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir tallers: ${response.statusText}`);
  }
  return await response.json();
}
export async function getTallerById(id) {
  const response = await fetch(`${BACK_URL}/tallers/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir taller per ID: ${response.statusText}`);
  }
  return await response.json();
}

export async function getTallersByPeriode(periodeId) {
  const response = await fetch(`${BACK_URL}/tallers?periode=${periodeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir tallers per període: ${response.statusText}`,
    );
  }
  return await response.json();
}

export async function createTaller(formData) {
  const response = await fetch(`${BACK_URL}/tallers`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (e) {
      console.warn("Failed to read error response text (createTallerForm)", e);
    }
    throw new Error(`Error al crear taller: ${response.status} ${text}`);
  }

  return await response.json();
}

export async function updateTaller(formData) {
  const response = await fetch(`${BACK_URL}/tallers`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (e) {
      console.warn("Failed to read error response text (updateTallerForm)", e);
    }
    throw new Error(`Error al actualitzar taller: ${response.status} ${text}`);
  }

  return await response.json();
}

export async function deleteTaller(id) {
  const response = await fetch(`${BACK_URL}/tallers`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Error al eliminar taller: ${response.statusText}`);
  }
  return await response.json();
}

export async function pointsTallers(tallerId) {
  const response = await fetch(
    `${BACK_URL}/tallers/${tallerId}/inscripcions-ordenadas`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //   Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `Error al calcular puntuacions del taller: ${response.statusText}`,
    );
  }
  return await response.json();
}

/* ------------------------------- USUARIS ------------------------------ */

export async function getAllUsuaris() {
  const response = await fetch(`${BACK_URL}/usuaris`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir usuaris: ${response.statusText}`);
  }
  return await response.json();
}

export async function getUsuariById(id) {
  const response = await fetch(`${BACK_URL}/usuaris/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir usuari per ID: ${response.error}`);
  }
  return await response.json();
}

export async function registerUsuari(usuariData) {
  const response = await fetch(`${BACK_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuariData),
  });
  if (!response.ok) {
    throw new Error(`Error al crear usuari: ${response.error}`);
  }
  return await response.json();
}

export async function acceptUsuari(usuariData) {
  const response = await fetch(`${BACK_URL}/usuaris/acceptat/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuariData),
  });
  if (!response.ok) {
    throw new Error(`Error al actualitzar usuari: ${response.statusText}`);
  }
  return await response.json();
}

export async function declineUsuari(id) {
  const response = await fetch(`${BACK_URL}/usuaris/denegat/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Error al denegar usuari: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- LOGIN ------------------------------ */

export async function loginUsuari(credentials) {
  const response = await fetch(`${BACK_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Error al iniciar sessió: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  return { message: data.message, user: data.user };
}

async function handleTokenRefresh(refreshToken, userId) {
  const response = await fetch(`${BACK_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: refreshToken, id: userId }),
  });

  if (!response.ok) {
    throw new Error(`Error al refrescar el token: ${response.statusText}`);
  }

  return await response.json();
}

/* ------------------------------- COMENTARIS ------------------------------ */

export async function saveComentariProfe(tallerId, idInstitucio, comentari) {
  const response = await fetch(
    `${BACK_URL}/tallers/${tallerId}/comentari-profe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idInstitucio: parseInt(idInstitucio),
        comentari,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Error al guardar comentari: ${response.statusText}`);
  }
  return await response.json();
}

export async function saveInscripcions(selecciones, docentRef, comentari) {
  const selectionsArray = Object.entries(selecciones).map(
    ([tallerId, numAlumnos]) => ({
      tallerId: Number(tallerId),
      numAlumnos: Number(numAlumnos),
    }),
  );

  const payload = {
    selecciones: selectionsArray,
    "docents-ref": docentRef?.trim() || null,
    comentari: comentari?.trim() || null,
  };

  const response = await fetch(`${BACK_URL}/inscripcions/dadesinsc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Error al guardar inscripciones: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- CRITERIS WEIGHTS ------------------------------ */

export async function getCriterisWeights() {
  const response = await fetch(`${BACK_URL}/criteris-weights`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir pesos de criteris: ${response.statusText}`,
    );
  }
  return await response.json();
}

export async function updateCriterisWeight(id, peso) {
  const response = await fetch(`${BACK_URL}/criteris-weights/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ peso: parseInt(peso) }),
  });
  if (!response.ok) {
    throw new Error(
      `Error al actualitzar pes de criterio: ${response.statusText}`,
    );
  }
  return await response.json();
}

/* ------------------------------- HISTORIC ------------------------------ */

export async function createHistoric(idInstitucion, periode, assistencia) {
  const response = await fetch(`${BACK_URL}/historic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idInstitucion: parseInt(idInstitucion),
      periode: parseInt(periode),
      assistencia: parseFloat(assistencia),
    }),
  });
  if (!response.ok) {
    throw new Error(`Error al guardar historic: ${response.statusText}`);
  }
  return await response.json();
}

export async function getHistoricByInstitucion(institucion) {
  const response = await fetch(
    `${BACK_URL}/historic/institucion/${institucion}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Error al obtenir historic: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- PERIODES ------------------------------ */

export async function getPeriodes() {
  const response = await fetch(`${BACK_URL}/periodes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtenir periodes: ${response.statusText}`);
  }
  return await response.json();
}

export async function createPeriode(dataIni, dataFi) {
  const response = await fetch(`${BACK_URL}/periodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataIni,
      dataFi,
    }),
  });
  if (!response.ok) {
    throw new Error(`Error al crear periode: ${response.statusText}`);
  }
  return await response.json();
}

/* ------------------------------- SYSTEM SETTINGS ------------------------------ */

export async function getSystemSettings() {
  const response = await fetch(`${BACK_URL}/system-settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Error al obtenir configuració del sistema: ${response.statusText}`,
    );
  }
  return await response.json();
}

export async function updateSystemSettings(id, selectedPeriodeId) {
  const response = await fetch(`${BACK_URL}/system-settings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      selectedPeriodeId,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Error al actualitzar configuració del sistema: ${response.statusText}`,
    );
  }
  return await response.json();
}
