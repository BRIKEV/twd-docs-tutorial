# Propuesta: avisar de mocks no consumidos

Estado: borrador, sin implementar.
Afecta a: `twd-js` (core + sidebar).

## El problema

El aislamiento entre tests en una SPA con navegación client-side no es total:
`twd.visit()` no resetea la caché de cliente. Con TanStack Query pasa esto:

1. El test 1 mockea `GET /todos` y la query cachea el resultado.
2. El test 2 mockea `GET /todos` con **otra** respuesta.
3. TanStack sirve la cache y **nunca hace la peticion**.
4. El mock nuevo no se aplica y el test falla por otra cosa distinta.

**El fallo aparece a tres pasos de la causa.** Eso es lo que cuesta la tarde, y
es un motivo real de abandono en la adopcion.

## Lo que ya existe y lo que se descarto

| Opcion | Estado |
|---|---|
| Reset declarativo por parte de la app (`onReset`) | **Ya implementado y documentado** |
| `cleanup()` de Testing Library | No aplica: en un flow test la app la monta `main.tsx`, no el test |
| Recargar la pagina entre tests | **Imposible**: el runner vive en la pagina, un reload se lo lleva |
| Remontar el root sin recargar | **Descartado por coste**: habria que documentarlo y soportarlo en 6 frameworks, y en Angular es doloroso |

## La propuesta

No intentar arreglar el aislamiento — mejorar el **diagnostico**.

TWD ya sabe que mocks se registraron y cuales se consumieron (`waitForRequest` y
los contadores de peticiones). Si un test registra un mock y termina **sin que se
haya pedido nunca**, avisar:

```
Warning: mock "getTodos" was never requested.
The component may be serving a client cache from a previous test.
Consider twd.onReset(() => queryClient.clear()).
```

## Por que esta y no otra

- **No toca ningun framework.** Solo sabe de peticiones HTTP, asi que funciona
  igual en React, Vue, Angular, Solid, HTMX y vanilla. Es la unica de las
  opciones que no multiplica superficie de documentacion ni de soporte.
- **Reutiliza infraestructura existente**: el registro de mocks y los contadores
  ya estan.
- **Ataca el dolor real.** El aislamiento imperfecto se tolera si la herramienta
  te dice por que falla; lo que expulsa a la gente es el fallo mudo.

## A refinar

- Warning o fallo. Empezar como warning; un mock no consumido puede ser
  legitimo (una ruta que el test no llega a tocar).
- Donde se ve: sidebar, salida de twd-cli, o ambos.
- Si conviene una forma de silenciarlo por mock (`{ optional: true }`) para los
  casos legitimos, y que asi el warning siga significando algo.
- Si el mismo mecanismo puede avisar del caso inverso: una peticion que se hizo
  y no tenia mock.
