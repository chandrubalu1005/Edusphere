exports.getKPIs = async (req, res) => {
  res.json({
    NAAC_Score: "3.62 / 4 (A++)", NBA_Accreditation: "9 out of 11 Departments Accredited",
    researchIndex: "H-Index 42", placementRatio: "92.4% average salary $8.2 LPA",
    retentionRate: "96.8%", studentSatisfaction: "4.7 / 5"
  });
};
exports.getBudgets = async (req, res) => {
  res.json([
    { department: "Computer Science", allocated: 2500000, spent: 2100000 },
    { department: "Electronics & Comm", allocated: 1800000, spent: 1750000 },
    { department: "Mechanical Engg", allocated: 1200000, spent: 980000 },
    { department: "Civil Engg", allocated: 900000, spent: 870000 }
  ]);
};