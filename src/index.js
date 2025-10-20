export default {
  async fetch(request, env, ctx) {
    const incomingApiKey = request.headers.get("Api-Key");

    if (incomingApiKey !== env.INNERGY_API_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Api-Key" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const response = await fetch("https://app.innergy.com/api/invoiceLineItems", {
        headers: {
          "Api-Key": incomingApiKey
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

      for (const group of groups.Items) {
        const { Project, ProjectManager, Items } = group;

        for (const item of Items) {
          result.push({
            invoiceNumber: item.InvoiceNumber,
            lineNumber: item.LineNumber,
            invoiceDate: item.InvoiceDate,
            invoiceDueDate: item.InvoiceDueDate,
            billingType: item.BillingType,
            description: item.Description,
            projectNumber: Project?.ProjectNumber,
            projectName: Project?.ProjectName,
            projectManager: ProjectManager?.FullName,
            customer: item.Customer,
            companyName: item.CompanyName,
            generalContractorName: item.GeneralContractorName,
            invoicedAmount: item.InvoicedAmount?.Value ?? 0,
            amountToBill: item.AmountToBill?.Cash?.Value ?? 0,
            salesTax: item.SalesTax?.Value ?? 0,
            exportedBy: item.ExportedBy ?? '',
            exportedDate: item.ExportedDate ?? ''
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
