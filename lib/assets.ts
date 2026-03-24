import type { Asset } from "@/lib/types";

export const ASSETS: Asset[] = [
  { id: "running", filename: "running.svg", tags: "run,running,jog,jogging,marathon,5k,sprint,cardio" },
  { id: "dumbbell", filename: "dumbbell.svg", tags: "gym,workout,exercise,lift,weight,dumbbell,fitness,strength" },
  { id: "bicycle", filename: "bicycle.svg", tags: "bike,bicycle,cycling,ride,cycle" },
  { id: "yoga", filename: "yoga.svg", tags: "yoga,stretch,meditation,meditate,mindfulness,breathe" },
  { id: "swim", filename: "swim.svg", tags: "swim,swimming,pool,laps" },
  { id: "book", filename: "book.svg", tags: "book,read,reading,study,chapter,library,literature" },
  { id: "pencil", filename: "pencil.svg", tags: "write,writing,pencil,pen,journal,essay,draft,note" },
  { id: "laptop", filename: "laptop.svg", tags: "code,coding,program,laptop,computer,develop,software,deploy,ship" },
  { id: "paintbrush", filename: "paintbrush.svg", tags: "paint,painting,art,draw,drawing,sketch,design,canvas,illustration" },
  { id: "guitar", filename: "guitar.svg", tags: "guitar,music,practice,play,instrument,song,band,piano,sing" },
  { id: "camera", filename: "camera.svg", tags: "camera,photo,photography,shoot,picture,film,video,record" },
  { id: "cooking", filename: "cooking.svg", tags: "cook,cooking,recipe,meal,food,bake,baking,kitchen,dinner,lunch" },
  { id: "coffee", filename: "coffee.svg", tags: "coffee,cafe,tea,drink,morning,espresso,latte" },
  { id: "language", filename: "language.svg", tags: "language,spanish,french,duolingo,vocab,grammar,translate,learn" },
  { id: "skateboard", filename: "skateboard.svg", tags: "skate,skateboard,skating,board,ollie" },
  { id: "sewing", filename: "sewing.svg", tags: "sew,sewing,needle,thread,stitch,knit,crochet,fabric" },
  { id: "clapboard", filename: "clapboard.svg", tags: "movie,film,watch,cinema,show,tv,series,netflix,stream" },
  { id: "shopping", filename: "shopping.svg", tags: "shop,shopping,grocery,groceries,buy,store,market,errand" },
  { id: "phone", filename: "phone.svg", tags: "call,phone,meeting,chat,zoom,standup,sync" },
  { id: "airplane", filename: "airplane.svg", tags: "travel,trip,flight,airplane,vacation,airport" },
  { id: "plant", filename: "plant.svg", tags: "plant,garden,gardening,water,grow,green,nature" },
  { id: "cleaning", filename: "cleaning.svg", tags: "clean,cleaning,tidy,organize,laundry,vacuum,chore,house" },
  { id: "mail", filename: "mail.svg", tags: "mail,email,letter,send,inbox,reply,message" },
  { id: "medical", filename: "medical.svg", tags: "doctor,medical,dentist,appointment,health,checkup,therapy" },
  { id: "star", filename: "star.svg", tags: "goal,milestone,achieve,celebrate,win,finish,complete,launch,ship" },
];

export function getAssetById(id: string): Asset | undefined {
  return ASSETS.find((a) => a.id === id);
}

export function getAssetFilenameById(id: string): string | undefined {
  return ASSETS.find((a) => a.id === id)?.filename;
}
