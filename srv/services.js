const cds = require('@sap/cds');


module.exports = cds.service.impl(async function () {
  const { Shipments, Packages } = this.entities;


  const RATES = {
    A: 15, // Air (A): 15
    S: 5,  // Sea (S): 5
    R: 8   // Rail (R): 8
  };


  this.after('READ', Shipments, async (rows, req) => {
    if (!rows) return;


    const list = Array.isArray(rows) ? rows : [rows];
    if (list.length === 0) return;


    const shipmentIds = list.map((s) => s.ID).filter(Boolean);
    if (shipmentIds.length === 0) return;


    // Consulta los paquetes asociados en BD por si no se expandieron en la petición inicial
    const dbPackages = await SELECT.from(Packages).where({
      parent_ID: { in: shipmentIds }
    });


    const weightByParent = new Map();
    for (const pkg of dbPackages) {
      const parentId = pkg.parent_ID;
      const current = weightByParent.get(parentId) || 0;
      weightByParent.set(parentId, current + Number(pkg.weight || 0));
    }


    for (const shipment of list) {
      let totalWeight = 0;


      if (Array.isArray(shipment.packages) && shipment.packages.length > 0) {
        totalWeight = shipment.packages.reduce(
          (sum, pkg) => sum + Number(pkg.weight || 0),
          0
        );
      } else {
        totalWeight = weightByParent.get(shipment.ID) || 0;
      }


      const modeKey = shipment.mode_code || shipment.mode;
      const rate = RATES[modeKey] ?? 0;


      shipment.totalWeight = Number(totalWeight.toFixed(2));
      shipment.shippingFee = Number((shipment.totalWeight * rate).toFixed(2));
    }
  });
});
