// useBoatyardLocation.js
import { useEffect, useState } from "react";
import { apiGet } from "../ultis/api";

export default function useBoatyardLocation(shipName) {
  const [boatyardLat, setBoatyardLat] = useState(null);
  const [boatyardLng, setBoatyardLng] = useState(null);
  const [boatyardName, setBoatyardName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipName) {
      setLoading(false);
      return;
    }

    const fetchBoatyardLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Bước 1: Lấy danh sách booking
        const bookingsRes = await apiGet("/bookings");
        const bookings = bookingsRes?.data?.items || [];

        console.log("[Boatyard] Tất cả bookings:", bookings.length);

        // Tìm booking Confirmed + typeService là "sơn tàu"
        const targetBooking = bookings.find((b) => {
          const isConfirmed = b.status === "Confirmed";
          const serviceType = (b.typeService || "").toLowerCase().trim();
          const isPaintService = serviceType.includes("sơn tàu") || serviceType === "son tau";
          const matchName = b.shipName === shipName;

          return isConfirmed && isPaintService && matchName;
        });

        if (!targetBooking) {
          console.log("[Boatyard] Không tìm thấy booking phù hợp (Confirmed + sơn tàu)");
          setLoading(false);
          return;
        }

        console.log("[Boatyard] Tìm thấy booking sơn tàu:", targetBooking.id);

        // Bước 2: Lấy chi tiết booking để lấy boatyardId
        const detailRes = await apiGet(`/bookings/${targetBooking.id}`);
        const bookingDetail = detailRes?.data;

        const boatyardId = bookingDetail?.boatyardId;

        if (!boatyardId) {
          console.log("[Boatyard] Booking không có boatyardId");
          setLoading(false);
          return;
        }

        console.log("[Boatyard] boatyardId:", boatyardId);

        // Bước 3: Gọi API kiểm tra dịch vụ của xưởng đó có "sơn tàu" không
        const servicesRes = await apiGet(`/api/v1/boatyards/${boatyardId}/boatyard-services`);
        const services = servicesRes?.data?.items || servicesRes?.data || [];

        const hasPaintService = services.some((service) => {
          const type = (service.typeService || "").toLowerCase();
          return type.includes("sơn tàu") || type === "son tau";
        });

        if (!hasPaintService) {
          console.log("[Boatyard] Xưởng này không cung cấp dịch vụ sơn tàu → bỏ qua");
          setLoading(false);
          return;
        }

        console.log("[Boatyard] Xưởng có dịch vụ sơn tàu → lấy tọa độ");

        // Bước 4: Lấy danh sách tất cả xưởng để tìm tọa độ theo ID
        const boatyardsRes = await apiGet("/api/v1/boatyards");
        const boatyards = boatyardsRes?.data?.data?.items || boatyardsRes?.data?.items || [];

        const targetBoatyard = boatyards.find((b) => b.id === boatyardId);

        if (targetBoatyard) {
          const lat = parseFloat(targetBoatyard.latitude);
          const lng = parseFloat(targetBoatyard.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            setBoatyardLat(lat);
            setBoatyardLng(lng);
            setBoatyardName(targetBoatyard.name || "Xưởng không tên");
            console.log(`[Boatyard] Tìm thấy xưởng: ${targetBoatyard.name} - ${lat}, ${lng}`);
          }
        } else {
          console.log("[Boatyard] Không tìm thấy xưởng trong danh sách");
        }
      } catch (err) {
        console.error("[Boatyard] Lỗi khi lấy vị trí xưởng:", err.response || err);
        setError(err.message || "Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };

    fetchBoatyardLocation();
  }, [shipName]);

  return { boatyardLat, boatyardLng, boatyardName, loading, error };
}