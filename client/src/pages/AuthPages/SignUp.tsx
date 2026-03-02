import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="OmniLocale - SMART Community"
        description="This is React.js SignUp Tables "
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
