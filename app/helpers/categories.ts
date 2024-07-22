import { translate } from "@/app/helpers/i18n";  // Import translate function
export type Category = {
  id: string;
  title: string;
  imageUrl: any;
  openCamera: boolean;
};
export const categories: Category[] = [
  {
    id: "1",
    title: translate("identify"),
    imageUrl: require("../../assets/images/marks.png"),
    openCamera: true
  },
  {
    id: "2",
    title: translate("fairPrice"),
    imageUrl: require("../../assets/images/fair-pricee.png"),
    openCamera: true
  },
  {
    id: "3",
    title: translate("read"),
    imageUrl: require("../../assets/images/menu.png"),
    openCamera: true
  },
  {
    id: "4",
    title: translate("donate"),
    imageUrl: require("../../assets/images/help.png"),
    openCamera: false,
  },
  {
    id: "5",
    title: translate("plan"),
    imageUrl: require("../../assets/images/plan.png"),
    openCamera: false,
  },
  {
    id: "6",
    title: translate("shop"),
    imageUrl: require("../../assets/images/shop.png"),
    openCamera: false,
  },
  {
    id: "7",
    title: translate("environmentalImpact"),
    imageUrl: require("../../assets/images/environmental.png"),
    openCamera: false,
  },
  {
    id: "8",
    title: translate("whatToSay"),
    imageUrl: require("../../assets/images/say.png"),
    openCamera: false,
  },
  {
    id: "9",
    title: translate("taboo"),
    imageUrl: require("../../assets/images/taboo.png"),
    openCamera: false,
  },
];
