export interface NeedCategory {
  category: string;
  needs: string[];
}

export const needsData: NeedCategory[] = [
  {
    category: "Visitor Reception and Orientation",
    needs: [
      "Ensure regular visitor reception",
      "Ensure limited visitor reception, guide them, exchange simple information with an interlocutor",
      "Communicate with confidence in the vast majority of reception situations"
    ]
  },
  {
    category: "Phone Communications",
    needs: [
      "Communicate fairly easily in telephone exchanges",
      "Exchange routine information in one's field over the phone",
      "Transfer calls/take very simple messages"
    ]
  },
  // ... Add all other categories from your list
];
