import PlumbService from "../PlumbService";

export default function usePlumbService() {
  const plumbService = new PlumbService();

  return { plumbService };
}
