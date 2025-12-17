# Documentació
Llistat d'alguns dels punts que han de quedar explicats en aquesta carpeta. Poden ser tots en aquest fitxer o en diversos fitxers enllaçats.

És obligatori modificar aquest document!!

## Documentació bàsica MÍNIMA
 * Objectius
 * Arquitectura bàsica
   * Tecnologies utilitzades
   * Interrelació entre els diversos components
 * Com crees l'entorn de desenvolupament
 * Com desplegues l'aplicació a producció
 * Llistat d'endpoints de l'API de backend (també podeu documentar-ho amb swagger)
    * Rutes
   * Exemples de JSON de peticó
   * Exemples de JSON de resposta i els seus codis d'estat 200? 404?
 * Aplicació Android
 * Altres elements importants.
 * ...

## Servidor i Arquitectura API

El punt d'entrada de l'aplicació és el fitxer `server.js`, el qual inicialitza un servidor **Express** escoltant al port **3000**.

### Filosofia del Projecte
L'arquitectura està dissenyada seguint un patró modular per mantenir el codi organitzat:

1.  **Endpoints per Model:** Per cada entitat (model) de la base de dades, s'exposa una ruta específica.
2.  **Gestió via Body:** La informació necessària per a les operacions es transmet principalment a través del *body* de la petició HTTP.
3.  **Desacoblament de Lògica:** El fitxer `server.js` actua com a enrutador. La lògica de negoci real no es troba aquí, sinó que es delega a funcions externes situades al directori `CRUD/`.
    * Estructura: `CRUD/[acció].js`

### Endpoints Disponibles

Actualment, el recurs que fa de dummy és **Tallers**.

| Mètode | Ruta | Descripció | Paràmetres esperats |
| :--- | :--- | :--- | :--- |
| **POST** | `/tallers` | Crea un nou taller. | Dades del taller al `req.body`. |
| **GET** | `/tallers` | Obté la llista de tallers. | Cap. |
| **PUT** | `/tallers` | Actualitza la informació d'un taller. | Dades a actualitzar al `req.body`. |
| **DELETE** | `/tallers` | Elimina un taller existent. | Identificador al `req.body` (pendent de definir lògica exacta). |

### ▶ Execució
Un cop instal·lades les dependències, el servidor s'inicia i estarà disponible a:
`http://localhost:3000`
