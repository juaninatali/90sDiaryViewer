export interface DiaryEntry {
  id: string;
  date: string; // ISO date format like "1992-03-15"
  title: string;
  location: string;
  tags: string[];
  text: string;
  images: string[];
}

export const diaryEntries: DiaryEntry[] = [
  {
    id: "entry-001",
    date: "1992-10-30",
    title: "Megabit",
    location: "Plaza TBC, Buenos Aires",
    tags: ["Venue: Plaza TBC", "Artist: Megabit", "Genre: Techno Pop"],
    text: `Una tarde de domingo fuimos con Luciano y Marcelo a una plaza o un parque a ver a un grupo que se llamaba Megabit.

La plaza estaba llena de hippies que nos miraban como si nosotros fuéramos los desubicados. El grupo era un desastre. La música estaba secuenciada, y el vocalista (que hablaba, no cantaba) tenía una guitarra MIDI con la cual ensuciaba las bases. También había un coro de dos chicas que no aportaba nada bueno.

Estaban Carlos y Matías de UT, Matías me vino a hablar para contarnos que iban a tocar dentro de poco. 

También me dijo que lo que mas escuchaba últimamente era Nine Inch Nails y Skinny Puppy.`,
    images: ["/images/TheFirstReport_037a.png", "/images/TheFirstReport_037b.png"]
  },
  {
    id: "entry-002",
    date: "1995-05-12",
    title: "Fellini",
    location: "Viamonte TBC, Buenos Aires",
    tags: ["Venue: Fellini.", "Genre: Hard Trance"],
    text: `Primera semana de trabajo en Radiomensaje y a pesar de eso escriba otra vez una pagina más acerca del techno local. Javier nos anotó en la lista de Fellini pero Luis no fue, ni Luciano, Hernán, ni tampoco los de la Universidad.

Nos encontrábamos con Fernando y Diego Garrincha en la esquina industrial pero al final no fueron porque estaban con un pelilargo (no techno). Una vez más, éramos Diego T. y yo, los únicos en la actividad permanente.

Al llegar, en Fellini se festejaba un cumpleaños y la gente (de evidente muy buena posición económica), bailaba al ritmo de temas vulgares. Después pasaron temas muy Madchester, Dark, y Hip-Hop. Nos fuimos a dar una vuelta por la zona de Congreso. 
La dueña, para que podamos volver a entrar, nos dibujó una letra F a cada uno en la mano derecha.

A la vuelta ya había un poco más de gente y la música iba mejorando. Comenzaron a pasar temas trance excelentes, intercalado de dos temas viejos: 'Love Is Life Is Mental' y 'This Is Acid' (entero). Después, temas trance descontroladísimos, break beats y bajos modulantes, mas de una hora de Hard Trance, un tema Hardcore Techno...

Dentro de un tiempo seguramente sabré nombres de los temas y grupos que suenan en Fellini. Por ahora la cantidad de compilados trance es enorme.
Fellini es Techno y voy a volver muchas veces.`,
    images: ["/images/TheFirstReport_072a.png", "/images/TheFirstReport_072b.png"]
  }
];