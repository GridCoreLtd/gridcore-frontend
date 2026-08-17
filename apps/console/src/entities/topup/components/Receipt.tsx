import type React from "react";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
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
    alignItems: "center", // ensure vertical center alignment
  },
  fieldTitle: {
    fontSize: 12,
    color: "#757575",
    fontFamily: "Helvetica-Bold",
    width: 140, // Adjusted width to ensure that all values align from the same starting point
    marginRight: 20, // Creates a gap between title and value
  },
  fieldValue: {
    fontSize: 12,
    color: "#212121",
    flex: 1, // Ensures that the fieldValue takes the rest of the space available
  },
  meterAddress: {
    fontSize: 12,
    color: "#212121",
    marginBottom: 5,
    flex: 1, // Makes the text wrap within the available space
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

const Receipt: React.FC<TopupProps> = ({ topup, logoSrc }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src={logoSrc || "/images/logo-yellow.png"} style={styles.logo} />

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
              ? formatCurrencyPlain({ amount: topup.transaction?.amount })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Payment Processing Fee</Text>
          <Text style={styles.fieldValue}>
            {topup?.transaction?.paymentProcessingFee
              ? formatCurrencyPlain({ amount: topup.transaction?.paymentProcessingFee })
              : "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Tariff</Text>
          <Text style={styles.fieldValue}>
            {topup.tariffUsed
              ? formatCurrencyPlain({ amount: topup.tariffUsed })
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
            {dateFormatter.format(new Date(topup.createdAt))}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldTitle}>Customer Name</Text>
          <Text style={styles.fieldValue}>
            {`${topup.user.firstName} ${topup.user.lastName}`}
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
      >{`Thank you for using ${topup?.user?.associatedMerchant?.businessName}!`}</Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {/*www.paygodash.com | support@paygodash.com*/}
          Powered by PayGo Dash
        </Text>
      </View>
    </Page>
  </Document>
);

export default Receipt;
