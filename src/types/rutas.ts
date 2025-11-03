export type Ruta = {
  id: number;
  nombre: string;
  puntoInicioId: number;
  puntoFinId: number;
  distancia: number;
  estado: boolean;
  puntoInicio?: Punto;
  puntoFin?: Punto;
};

export type Punto = {
  id: number;
  nombre: string;
  direccion: string;
  provincia: string;
  tipoPunto: string;
};
