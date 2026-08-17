import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrencyPlain } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  logo: {
    width: 130,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    color: "#333",
    marginBottom: 30,
    fontFamily: "Helvetica-Bold",
  },
  section: {
    margin: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldTitle: {
    fontSize: 12,
    color: "#757575",
    fontFamily: "Helvetica-Bold",
    width: 140,
    marginRight: 20,
  },
  fieldValue: {
    fontSize: 12,
    color: "#212121",
    flex: 1,
  },
  meterAddress: {
    fontSize: 12,
    color: "#212121",
    marginBottom: 5,
    flex: 1,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#616161",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  thankYou: {
    fontSize: 16,
    textAlign: "center",
    color: "#2626FD",
    marginTop: 30,
  },
  contentWrapper: {
    margin: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
});

interface TopupProps {
  topup: any;
  logoSrc?: string;
}

const Receipt: React.FC<TopupProps> = ({ topup, logoSrc }) => {
  const merchant = topup?.user?.associatedMerchant;
  // logoSrc is a pre-resolved data URL (the merchant's logo) prepared by the
  // caller via resolveReceiptLogo, which falls back to a bundled PNG on any
  // failure. Guard here too so a direct render never crashes react-pdf.
  const logo = logoSrc || "/images/logo-yellow.png";
  const customerName =
    [topup?.user?.firstName, topup?.user?.lastName]
      .filter(Boolean)
      .join(" ") || "N/A";
  const createdAtDate = topup?.createdAt ? new Date(topup.createdAt) : null;
  const formattedDate =
    createdAtDate && !isNaN(createdAtDate.getTime())
      ? dateFormatter.format(createdAtDate)
      : "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logo} style={styles.logo} />

      <Text style={styles.title}>Transaction Summary</Text>

      <View style={styles.contentWrapper}>
        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Token</Text>
          <Text style={styles.fieldValue}>{topup?.token || "N/A"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Transaction Ref.</Text>
          <Text style={styles.fieldValue}>
            {topup?.transaction?.reference || "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Meter No.</Text>
          <Text style={styles.fieldValue}>
            {topup?.meter?.meterNumber || "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>No. of Units</Text>
          <Text style={styles.fieldValue}>{topup?.noOfUnits}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Amount</Text>
          <Text style={styles.fieldValue}>
            {topup?.transaction?.amount
              ? formatCurrencyPlain({ amount: topup.transaction?.amount, currency: topup?.user?.associatedMerchant?.currency, country: topup?.user?.associatedMerchant?.country })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Payment Processing Fee</Text>
          <Text style={styles.fieldValue}>
            {topup?.transaction?.paymentProcessingFee
              ? formatCurrencyPlain({ amount: topup.transaction?.paymentProcessingFee, currency: topup?.user?.associatedMerchant?.currency, country: topup?.user?.associatedMerchant?.country })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Tariff</Text>
          <Text style={styles.fieldValue}>
            {topup.tariffUsed
              ? formatCurrencyPlain({ amount: topup.tariffUsed, currency: topup?.user?.associatedMerchant?.currency, country: topup?.user?.associatedMerchant?.country })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Payment Method</Text>
          <Text style={styles.fieldValue}>
            {topup?.transaction?.source
              ? sentenceCaseFormatter(topup.transaction.source)
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Status</Text>
          <Text style={styles.fieldValue}>
            {topup?.topupStatus
              ? sentenceCaseFormatter(topup.topupStatus)
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Date</Text>
          <Text style={styles.fieldValue}>
            {formattedDate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Customer Name</Text>
          <Text style={styles.fieldValue}>
            {customerName}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Meter Address</Text>
          <Text style={styles.meterAddress}>
            {topup?.meter?.meterAddress || "N/A"}
          </Text>
        </View>
      </View>

      <Text
        style={styles.thankYou}
      >{`Thank you for using ${merchant?.businessName ?? "PayGoDash"}!`}</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {/*www.paygodash.com | support@paygodash.com*/}
          Powered by Gridcore
        </Text>
      </View>
    </Page>
    </Document>
  );
};

export default Receipt;
