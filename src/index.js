export default {
  async fetch(request, env, ctx) {
    try {
      const response = await fetch("https://app.innergy.com/api/invoiceLineItems", {
        headers: {
          "Api-Key": env.INNERGY_API_KEY
        }
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch from Innergy" }), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // The response is a raw array
      const groups = await response.json();
      const result = [];

      for (const group of groups) {
        const { project, projectManager, items } = group;

        for (const item of items) {
          result.push({
            invoiceNumber: item.invoiceNumber,
            lineNumber: item.lineNumber,
            invoiceDate: item.invoiceDate,
            invoiceDueDate: item.invoiceDueDate,
            billingType: item.billingType,
            description: item.description,
            projectNumber: project?.projectNumber,
            projectName: project?.projectName,
            projectManager: projectManager?.fullName,
            customer: item.customer,
            companyName: item.companyName,
            generalContractorName: item.generalContractorName,
            invoicedAmount: item.invoicedAmount?.value ?? 0,
            amountToBill: item.amountToBill?.cash?.value ?? 0,
            salesTax: item.salesTax?.value ?? 0,
            exportedBy: item.exportedBy ?? '',
            exportedDate: item.exportedDate ?? ''
          });
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal error", detail: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
