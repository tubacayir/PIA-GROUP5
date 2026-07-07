export type PackageSegment =
  | "INDIVIDUAL"
  | "CORPORATE";

export type PackageAllowance =
  | number
  | "UNLIMITED";

export interface PiacellPackage {
  code: string;
  name: string;
  segment: PackageSegment;
  internetGb: number;
  sms: PackageAllowance;
  minutes: PackageAllowance;
  monthlyPrice: number;
  hasFup?: boolean;
}

export const individualPackages: PiacellPackage[] = [
  {
    code: "PJ10",
    name: "Piacell Genç 10",
    segment: "INDIVIDUAL",
    internetGb: 10,
    sms: 250,
    minutes: 1_000,
    monthlyPrice: 399,
  },
  {
    code: "PN20",
    name: "Piacell Nova 20",
    segment: "INDIVIDUAL",
    internetGb: 20,
    sms: 500,
    minutes: 1_500,
    monthlyPrice: 549,
  },
  {
    code: "PN35",
    name: "Piacell Nova+ 35",
    segment: "INDIVIDUAL",
    internetGb: 35,
    sms: 750,
    minutes: 2_000,
    monthlyPrice: 699,
  },
  {
    code: "PN50",
    name: "Piacell Nova Max 50",
    segment: "INDIVIDUAL",
    internetGb: 50,
    sms: 1_000,
    minutes: 3_000,
    monthlyPrice: 899,
  },
  {
    code: "PN100",
    name: "Piacell Nova Unlimited",
    segment: "INDIVIDUAL",
    internetGb: 100,
    sms: 1_000,
    minutes: "UNLIMITED",
    monthlyPrice: 1_199,
    hasFup: true,
  },
];

export const corporatePackages: PiacellPackage[] = [
  {
    code: "BC20",
    name: "Business Core 20",
    segment: "CORPORATE",
    internetGb: 20,
    sms: 500,
    minutes: 2_000,
    monthlyPrice: 599,
  },
  {
    code: "BP35",
    name: "Business Pro 35",
    segment: "CORPORATE",
    internetGb: 35,
    sms: 750,
    minutes: 3_000,
    monthlyPrice: 799,
  },
  {
    code: "BE40",
    name: "Business Elite 40",
    segment: "CORPORATE",
    internetGb: 40,
    sms: 1_000,
    minutes: 5_000,
    monthlyPrice: 949,
  },
  {
    code: "BE60",
    name: "Business Elite+ 60",
    segment: "CORPORATE",
    internetGb: 60,
    sms: 2_000,
    minutes: "UNLIMITED",
    monthlyPrice: 1_199,
  },
  {
    code: "BX100",
    name: "Business X 100",
    segment: "CORPORATE",
    internetGb: 100,
    sms: "UNLIMITED",
    minutes: "UNLIMITED",
    monthlyPrice: 1_599,
  },
];

export const allPackages = [
  ...individualPackages,
  ...corporatePackages,
];

export const getPackageByCode = (
  packageCode: string
) =>
  allPackages.find(
    (item) => item.code === packageCode
  );

export const getNextPackage = (
  packageCode: string
): PiacellPackage | null => {
  const currentPackage = getPackageByCode(packageCode);

  if (!currentPackage) {
    return null;
  }

  const packages =
    currentPackage.segment === "INDIVIDUAL"
      ? individualPackages
      : corporatePackages;

  const currentIndex = packages.findIndex(
    (item) => item.code === packageCode
  );

  return packages[currentIndex + 1] ?? null;
};
