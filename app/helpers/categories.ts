import { translate } from "@/app/helpers/i18n";  // Import translate function

export type Category = {
    id: string;
    title: string;
    imageUrl: any;
  };
  
  export const categories: Category[] = [
    {
      id: "1",
      title: translate("identify"),
      imageUrl: require("../../assets/images/marks.png"),
    },
    {
      id: "2",
      title: translate("fairPrice"),
      imageUrl: require("../../assets/images/fair-pricee.png"),
    },
    {
      id: "3",
      title: translate("read"),
      imageUrl: require("../../assets/images/menu.png"),
    },
    {
      id: "4",
      title: translate("donate"),
      imageUrl: require("../../assets/images/help.png"),
    },
    {
      id: "5",
      title: translate("plan"),
      imageUrl: require("../../assets/images/plan.png"),
    },
    {
      id: "6",
      title: translate("shop"),
      imageUrl: require("../../assets/images/shop.png"),
    },
    {
      id: "7",
      title: translate("environmentalImpact"),
      imageUrl: require("../../assets/images/environmental.png"),
    },
    {
      id: "8",
      title: translate("whatToSay"),
      imageUrl: require("../../assets/images/say.png"),
    },
  ];