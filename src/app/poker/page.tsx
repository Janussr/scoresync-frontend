"use client";

import { Stack, Box } from "@mui/material";
import Image from "next/image";

export default function PokerPage() {
  return (
    <div>
      <Stack spacing={2} direction="row" justifyContent="center" mt={5}>


        <Box sx={{
          width: "100%",
          maxWidth: { md: 350 },
          mx: "auto",
          px: { xs: 1, md: 0 },
          mt: 4,
        }}>
          <Image
            src="/images/poker-cheatsheet.jpg"
            alt="Black Jack Cheatsheet"
            width={500}
            height={300}
            priority
            style={{ width: "100%", height: "auto", margin: "0 auto" }}
          />
        </Box>

      </Stack>
    </div>
  );
}
