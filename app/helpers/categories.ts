export type Category = {
  id: string;
  title: string;
  imageUrl: any;
  command: string;
  openCamera: boolean;
};
export const categories = (translate : Function) => [
  {
    id: "1",
    title: translate("identify"),
    command: "identify",
    imageUrl: require("../../assets/images/marks.png"),
    openCamera: true,
  },
  {
    id: "2",
    title: translate("fairPrice"),
    command: "price",
    imageUrl: require("../../assets/images/fair-pricee.png"),
    openCamera: true,
  },
  {
    id: "3",
    title: translate("read"),
    command: "read",
    imageUrl: require("../../assets/images/menu.png"),
    openCamera: true,
  },
  {
    id: "4",
    title: translate("donate"),
    command: "donate",
    imageUrl: require("../../assets/images/help.png"),
    openCamera: false,
  },
  {
    id: "5",
    title: translate("plan"),
    command: "plan",
    imageUrl: require("../../assets/images/plan.png"),
    openCamera: false,
  },
  {
    id: "6",
    title: translate("shop"),
    command: "shop",
    imageUrl: require("../../assets/images/shop.png"),
    openCamera: false,
  },
  {
    id: "7",
    title: translate("environmentalImpact"),
    command: "impact",
    imageUrl: require("../../assets/images/environmental.png"),
    openCamera: false,
  },
  {
    id: "8",
    title: translate("whatToSay"),
    command: "say",
    imageUrl: require("../../assets/images/say.png"),
    openCamera: false,
  },
  {
    id: "9",
    title: translate("taboo"),
    command: "taboo",
    imageUrl: require("../../assets/images/taboo.png"),
    openCamera: false,
  },
  {
    id: "10",
    title: translate("tips"),
    command: "tips",
    imageUrl: require("../../assets/images/tips.png"),
    openCamera: false,
  },
  {
    id: "10",
    title: translate("mood"),
    command: "mood",
    imageUrl: require("../../assets/images/mood.png"),
    openCamera: false,
  },
  {
    id: "11",
    title: translate("culturalVideoAnalyzer"),
    command: "video",
    imageUrl: require("../../assets/images/youtube.png"),
    openCamera: false,
  },
  {
    id: "11",
    title: translate("travelMemories"),
    command: "photos",
    imageUrl: require("../../assets/images/photos.png"),
    openCamera: false,
  },
];
